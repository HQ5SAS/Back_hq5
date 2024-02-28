import { consultPermissionClient } from '../../Lib/serviceClient.function.js';
import { consultRecordWz } from '../../Lib/wz.function.js';
import { createErrorResponse, createCustomersResponse } from '../../Tools/utils.js';
import { redirectMemberToNode } from '../../Tools/woztell.js';
import { PERM_STATE_ACT, PERM_STATE_INACT } from '../../Database/fields.js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

// Funcion para acceder al metodo de respuesta estandar en utils.js
async function logAndRespond(res, message, statusCode, data = null) {
    const response = createCustomersResponse(message, statusCode, data);
    res.status(statusCode).json(response);
    return response;
}

// Función para redirigir en Woztell según el nodo y los datos proporcionados
function redirectWoztell(node, memberId, additionalData = {}) {
    redirectMemberToNode(node, memberId, null, additionalData);
}

// Función para consultar los servicios disponibles por cliente a través de WhatsApp
async function consultServiceClient(req, res) {
    try {
        // Validar cuerpo de la solicitud
        const { member, customer } = req.body;
        if (!member || !customer) {
            return logAndRespond(res, 'Clave (member) o (customer) no encontrada en el cuerpo de la solicitud', 400);
        }

        // Respuesta a la solicitud realizada
        logAndRespond(res, 'Solicitud procesada correctamente', 200);

        // Consultar los permisos por cliente
        const { _id: id, externalId, app } = member;
        const wz_id = await consultRecordWz(id, externalId, app);
        const cel = parseInt(wz_id.externalId.substring(2));
        const permission = await consultPermissionClient(cel, customer);

        // Si el contacto no tiene permisos, redireccionarlo en Woztell
        if (!permission || permission.length === 0) {
            return redirectWoztell(process.env.WZ_NODE_NOT_PERM_CONT_CUST, wz_id.memberId);
        }

        // Si el contacto tiene todos los permisos inactivos, redireccionarlo en Woztell
        const permissionInactive = permission.every(permit => permit.estado === PERM_STATE_INACT);
        if (permissionInactive) {
            return redirectWoztell(process.env.WZ_NODE_NOT_PERM_ACT_CONT, wz_id.memberId);
        }

        // Si el contacto tiene permisos activos, redireccionarlo en Woztell
        const permissionActive = permission.filter(permit => permit.estado === PERM_STATE_ACT);
        const optionsMap = new Map(permissionActive.map(permit => [permit.tarea_bot_id, permit.nombre_tarea_bot]));
        const mapData = Object.fromEntries([...optionsMap.entries()].map(([id, nombre], index) => [index + 1, `${id}`]));
        const message = [...optionsMap.entries()].map(([id, nombre], index) => `${index + 1}️⃣  ${nombre}`).join('\n');
        return redirectWoztell(process.env.WZ_NODE_OPTION_TASK, wz_id.memberId, {
            customer: customer,
            task: { ...mapData },
            message: message
        });

    } catch (error) {
        console.error('Error en la consulta de los servicios de cliente:', error);
        const errorResponse = createErrorResponse('Error interno del servidor', 500);
        res.status(errorResponse.statusCode).json(errorResponse);
    }
}

// Controlador para consultar los servicios por cliente a traves de whatsapp
const requestsController = { consultServiceClient };
export default requestsController;