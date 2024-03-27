import { consultRecordWz } from '../../Lib/wz.function.js';
import { consultContact } from '../../Lib/contact.function.js';
import { consultPermission } from '../../Lib/permit.function.js';
import { getOperationManager } from '../../Lib/EntryOrder/operationManager.function.js';
import { createErrorResponse, logAndRespond } from '../../Tools/utils.js';
import { redirectWoztellByMemberId } from '../../Tools/woztell.js';
import { CONT_STATE_ACT, PERM_STATE_ACT, PERM_STATE_INACT } from '../../Database/fields.js';
import { nameServiceProd } from '../../Tools/taskName.js';
import { devContact } from '../../Tools/devContact.js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

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

        // Si no existe el contacto, redireccionarlo en Woztell - No envio data porque no existe el registro por seguridad de informacion
        if (!contact || contact.length === 0) {
            return redirectWoztellByMemberId(process.env.WZ_NODE_UNREG_CONT, wz_id.memberId);
        }

        // Formar objeto de data global en los nodos de whatsapp
        const contactRecord = contact[0];
        const initObject = await getOperationManager(contactRecord);

        // Si existe más de un cliente el contacto, redireccionarlo en Woztell
        if (contact.length > 1) {
            const customerMap = new Map(contact.map(item => [item.id_cliente, item.cliente]));
            const mapData = Object.fromEntries([...customerMap.entries()].map(([id, cliente], index) => [index + 1, `${id}`]));
            const message = [...customerMap.entries()].map(([id, cliente], index) => `${index + 1}️⃣  ${cliente}`).join('\n');
            return redirectWoztellByMemberId(process.env.WZ_NODE_OPTION_CUSTOMER, wz_id.memberId, {
                customer: { ...mapData },
                message: message,
                ...initObject
            });
        }

        // Si existe un sólo contacto inactivo, redireccionarlo en Woztell
        if (!contactRecord || contactRecord.estado !== CONT_STATE_ACT) {
            return redirectWoztellByMemberId(process.env.WZ_NODE_NOT_ACT_CONT, wz_id.memberId, {
                ...initObject
            });
        }

        // Si el contacto no tiene permisos, redireccionarlo en Woztell
        const permission = await consultPermission(contactRecord.id);
        if (!permission || permission.length === 0) {
            return redirectWoztellByMemberId(process.env.WZ_NODE_NOT_PERM_CONT, wz_id.memberId, {
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
        //const activePermissions = permission.filter(permit => permit.estado === PERM_STATE_ACT);
        //const optionsMap = new Map(activePermissions.map(permit => [permit.tarea_bot_id, permit.nombre_tarea_bot]));
        //const filteredOptionsMap = devContact.includes(cel.toString()) ? optionsMap : new Map([...optionsMap].filter(([key, value]) => nameServiceProd.includes(value)));
        //const mapData = Object.fromEntries([...filteredOptionsMap.entries()].map(([id, nombre], index) => [index + 1, `${id}`]));
        //const message = [...filteredOptionsMap.entries()].map(([id, nombre], index) => `${index + 1}️⃣  ${nombre}`).join('\n');

        // Si el contacto tiene permisos activos, redireccionarlo en Woztell
        const activePermissions = permission.filter(permit => permit.estado === PERM_STATE_ACT);
        const filteredPermissions = devContact.includes(cel.toString()) ? activePermissions : activePermissions.filter(permit => nameServiceProd.includes(permit.nombre_tarea_bot));

        // Agrupar los datos por nombre_proceso
        const groupedData = filteredPermissions.reduce((objf, obj) => {
            const { nombre_proceso, tarea_bot_id, nombre_tarea_bot } = obj;
            objf[nombre_proceso] = objf[nombre_proceso] || [];
            objf[nombre_proceso].push({ tarea_bot_id, nombre_tarea_bot });
            return objf;
        }, {});

        // Convertir los grupos en mapData
        let taskIndex = 1;
        const mapData = Object.fromEntries(
            Object.values(groupedData).flatMap(
                tasks => tasks.map(task => [taskIndex++, task.tarea_bot_id])
            )
        );
                
        // Convertir los grupos en message
        taskIndex = 1;
        /*
        const message = Object.entries(groupedData).map(([proceso, tasks]) => {
            const taskList = tasks.map(({ tarea_bot_id, nombre_tarea_bot }) => `${taskIndex++}️⃣  ${nombre_tarea_bot}`).join('\n');
            return `*${proceso}*:\n${taskList}`;
        }).join('\n');
        */
        const message = Object.entries(groupedData).map(([proceso, tasks]) => {
            const taskList = tasks.map(({ tarea_bot_id, nombre_tarea_bot }) => {
                const indexString = taskIndex < 10 ? String(taskIndex) : String(taskIndex).padStart(2, '0');
                taskIndex++;
                return `${indexString}️⃣  ${nombre_tarea_bot}`;
            }).join('\n');
            return `*${proceso}*:\n${taskList}`;
        }).join('\n');

        return redirectWoztellByMemberId(process.env.WZ_NODE_OPTION_TASK, wz_id.memberId, {
            customer: contactRecord.id_cliente,
            task: { ...mapData },
            message: message,
            ...initObject
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