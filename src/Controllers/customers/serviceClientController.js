import * as functionsServiceClient from '../../Lib/functionsServiceClient.js';
import { createErrorResponse, createCustomersResponse } from '../../Tools/utils.js';
import { PERM_STATE_ACT, PERM_STATE_INACT } from '../../Database/fields.js';
import { NOT_PER, NOT_PER_ACT, TASK_BOT} from '../../Tools/process.js';

async function logAndRespond(res, message, statusCode, process = null, data = null) {
    const response = createCustomersResponse(message, statusCode, process, data);
    res.status(statusCode).json(response);
    return response;
}

async function consultServiceClient(req, res) {
    try {

        // Validar contenido de la solicitud
        const { member, customer } = req.body;
        if (!member || !customer) {
            return logAndRespond(res, 'Clave (member) o (customer) no encontrada en el cuerpo de la solicitud', 400);
        }

        const cel = parseInt(member.externalId.substring(2));
        const permission = await functionsServiceClient.consultPermissionClient(cel, customer);

        if (!permission || permission.length === 0) {
            return logAndRespond(res, 'No tienes permisos actualmente', 403, NOT_PER);
        }
        
        const permissionInactive = permission.every(permit => permit.estado === PERM_STATE_INACT);

        if (permissionInactive) {
            return logAndRespond(res, 'No tienes permisos activos', 403, NOT_PER_ACT);
        }

        const permissionActive = permission.filter(permit => permit.estado === PERM_STATE_ACT);
        const optionsMap = new Map(permissionActive.map(permit => [permit.tarea_bot_id, permit.nombre_tarea_bot]));
        const mapData = Object.fromEntries([...optionsMap.entries()].map(([id, nombre], index) => [index + 1, `${id}`]));
        const message = [...optionsMap.entries()].map(([id, nombre], index) => `${index + 1}️⃣  ${nombre}`).join('\n');
        
        const data = {
            customer: customer,
            task: { ...mapData }
        }; 

        return logAndRespond(res, message, 200, TASK_BOT, data);

    } catch (error) {
        console.error('Error en la consulta de los servicios de cliente:', error);
        const errorResponse = createErrorResponse('Error interno del servidor', 500);
        res.status(errorResponse.statusCode).json(errorResponse);
    }
}

const requestsController = { consultServiceClient };
export default requestsController;