import { consultRecordWz } from '../../Lib/wz.function.js';
import { consultContact, consultPermission } from '../../Lib/contact.function.js';
import { createErrorResponse, createCustomersResponse } from '../../Tools/utils.js';
import { redirectMemberToNode } from '../../Tools/woztell.js';
import { CONT_STATE_ACT, PERM_STATE_ACT, PERM_STATE_INACT } from '../../Database/fields.js';
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

// Funcion para validar el contacto que escribe en el bot de WhatsApp cliente
async function validateContact(req, res) {
    try {
        // Validar cuerpo de la solicitud
        const { member } = req.body;
        if (!member) {
            return logAndRespond(res, 'Clave (member) no encontrada en el cuerpo de la solicitud', 400);
        }

        // Realizar respuesta a la solicitud
        logAndRespond(res, 'Solicitud procesada correctamente', 200);

        // Consultar registros asociados en las tablas de la db HQ5
        const { _id: memberId, externalId, app } = member;
        const wz_id = await consultRecordWz(memberId, externalId, app);
        const cel = parseInt(wz_id.externalId.substring(2));
        const contact = await consultContact(cel, wz_id.id);

        // Si no existe el contacto, redireccionarlo en Woztell
        if (!contact || contact.length === 0) {
            return redirectWoztell(process.env.WZ_NODE_UNREG_CONT, wz_id.memberId);
        }

        // Si existe más de un contacto, redireccionarlo en Woztell
        if (contact.length > 1) {
            const customerMap = new Map(contact.map(item => [item.id_cliente, item.cliente]));
            const mapData = Object.fromEntries([...customerMap.entries()].map(([id, cliente], index) => [index + 1, `${id}`]));
            const message = [...customerMap.entries()].map(([id, cliente], index) => `${index + 1}️⃣  ${cliente}`).join('\n');
            return redirectWoztell(process.env.WZ_NODE_OPTION_CUSTOMER, wz_id.memberId, {
                customer: { ...mapData },
                message: message
            });
        }

        // Si existe un sólo contacto inactivo, redireccionarlo en Woztell
        const contactRecord = contact[0];
        if (!contactRecord || contactRecord.estado !== CONT_STATE_ACT) {
            return redirectWoztell(process.env.WZ_NODE_NOT_ACT_CONT, wz_id.memberId);
        }

        // Si el contacto no tiene permisos, redireccionarlo en Woztell
        const permission = await consultPermission(contactRecord.id);
        if (!permission || permission.length === 0) {
            return redirectWoztell(process.env.WZ_NODE_NOT_PERM_CONT, wz_id.memberId);
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
            customer: contactRecord.zh_id_cliente,
            task: { ...mapData },
            message: message
        });

    } catch (error) {
        console.error('Error en la consulta del contacto:', error);
        const errorResponse = createErrorResponse('Error interno del servidor', 500);
        res.status(errorResponse.statusCode).json(errorResponse);
    }
}

// Controlador para validacion de contactos por whatsapp cliente
const requestsController = { validateContact };
export default requestsController;