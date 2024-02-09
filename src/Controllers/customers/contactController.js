import * as functionsWoztell from '../../Lib/functionsWoztell.js';
import * as functionsContact from '../../Lib/functionsContact.js';
import { createErrorResponse, createCustomersResponse } from '../../Tools/utils.js';
import { UN_REG, CLIENTE, NOT_ACT, NOT_PER, NOT_PER_ACT, TASK_BOT} from '../../Tools/process.js';
import { CONT_STATE_ACT, CONT_STATE_INACT } from '../../Database/fields.js';
import { PERM_STATE_ACT, PERM_STATE_INACT } from '../../Database/fields.js';

async function logAndRespond(res, message, statusCode, process = null, data = null) {
    const response = createCustomersResponse(message, statusCode, process, data);
    res.status(statusCode).json(response);
    return response;
}

async function validateContact(req, res) {
    try {
        
        // Validar contenido de la solicitud
        const { member } = req.body;
        if (!member) {
            return logAndRespond(res, 'Clave (member) no encontrada en el cuerpo de la solicitud', 400);
        }
        
        const { _id: id, externalId, app } = member;

        // Consultar si esta registrado en la tabla wz
        const wz_id = await functionsWoztell.consultRecordWz(id, externalId, app);
        const cel = parseInt(wz_id.externalId.substring(2));

        // Consultar si el celular está registrado en la tabla contacto
        const contact = await functionsContact.consultContact(cel);
        
        if (!contact || contact.length === 0) {
            return logAndRespond(res, 'No registrado', 404, UN_REG);
        } 
        
        if (contact.length > 1) {
            const customerMap = new Map(contact.map(item => [item.id, item.cliente]));
            const mapData = Object.fromEntries([...customerMap.entries()].map(([id, cliente], index) => [index + 1, `${id}`]));
            const message = [...customerMap.entries()].map(([id, cliente], index) => `${index + 1}️⃣  ${cliente}`).join('\n');

            const data = {
                customer: { ...mapData }
            }; 

            return logAndRespond(res, message, 200, CLIENTE, data);
        }

        const contactRecord = contact[0];

        if (!contactRecord || contactRecord.estado !== CONT_STATE_ACT) {
            return logAndRespond(res, 'No activo', 404, NOT_ACT);
        }

        if (!res.headersSent) {
            const permission = await functionsContact.consultPermission(contactRecord.id);

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
                
                customer: contactRecord.id_cliente.toString(),
                task: { ...mapData }
            }; 

            return logAndRespond(res, message, 200, TASK_BOT, data);
        }

    } catch (error) {
        console.error('Error en la consulta del contacto:', error);
        const errorResponse = createErrorResponse('Error interno del servidor', 500);
        res.status(errorResponse.statusCode).json(errorResponse);
    }
}

const requestsController = { validateContact };
export default requestsController;