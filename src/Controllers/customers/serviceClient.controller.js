import { consultRecordWz } from '../../Lib/wz.function.js';
import { consultContact } from '../../Lib/contact.function.js';
import { consultPermissionClient } from '../../Lib/permit.function.js';
import { getOperationManager } from '../../Lib/EntryOrder/operationManager.function.js';
import { redirectWoztellByMemberId } from '../../Tools/woztell.js';
import { createErrorResponse, logAndRespond } from '../../Tools/utils.js';
import { PERM_STATE_ACT, PERM_STATE_INACT } from '../../Database/fields.js';
import { nameServiceProd } from '../../Tools/taskName.js';
import { devContact } from '../../Tools/devContact.js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

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
        const { _id: memberId, externalId, app } = member;
        const wz_id = await consultRecordWz(memberId, externalId, app);
        const cel = parseInt(wz_id.externalId.substring(2));
        const contact = await consultContact(cel, wz_id.id);
        const permission = await consultPermissionClient(cel, customer);

        // Formar objeto de data global en los nodos de whatsapp
        const contactRecord = contact[0];
        const initObject = await getOperationManager(contactRecord);

        // Si el contacto no tiene permisos, redireccionarlo en Woztell
        if (!permission || permission.length === 0) {
            return redirectWoztellByMemberId(process.env.WZ_NODE_NOT_PERM_CONT_CUST, wz_id.memberId, {
                ...initObject
            });
        }

        // Si el contacto tiene todos los permisos inactivos, redireccionarlo en Woztell
        const permissionInactive = permission.every(permit => permit.estado === PERM_STATE_INACT);
        if (permissionInactive) {
            return redirectWoztellByMemberId(process.env.WZ_NODE_NOT_PERM_ACT_CONT, wz_id.memberId, {
                ...initObject
            });
        }

        // Si el contacto tiene permisos activos, redireccionarlo en Woztell
        const activePermissions = permission.filter(permit => permit.estado === PERM_STATE_ACT);
        const optionsMap = new Map(activePermissions.map(permit => [permit.tarea_bot_id, permit.nombre_tarea_bot]));
        const filteredOptionsMap = devContact.includes(cel) ? optionsMap : new Map([...optionsMap].filter(([key, value]) => nameServiceProd.includes(value)));
        const mapData = Object.fromEntries([...filteredOptionsMap.entries()].map(([id, nombre], index) => [index + 1, `${id}`]));
        const message = [...filteredOptionsMap.entries()].map(([id, nombre], index) => `${index + 1}️⃣  ${nombre}`).join('\n');
        return redirectWoztellByMemberId(process.env.WZ_NODE_OPTION_TASK, wz_id.memberId, {
            customer: customer,
            task: { ...mapData },
            message: message,
            ...initObject
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