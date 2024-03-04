import { consultRecordWz } from '../../Lib/wz.function.js';
import { consultContactByCelAndCustomer } from '../../Lib/contact.function.js';
import { createRequestWz, consultRequestWz } from '../../Lib/requestWz.function.js';
import { consultTask } from '../../Lib/task.function.js';
import { createErrorResponse, logAndRespond, createURLWithToken, generateToken } from '../../Tools/utils.js';
import { redirectWoztellByMemberId } from '../../Tools/woztell.js';
import { entryOrder, employeeWithdrawalMarking } from '../../Tools/taskName.js';
import { logWhatsAppCustomerMessages } from '../../Tools/zoho.js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

// Funcion para crear el path de la tarea que solicito el cliente a traves de whatsapp
async function responseRequest(req, res) {
    try {
        // Validar cuerpo de la solicitud
        const { member, customer, task } = req.body;
        if (!member || !customer || !task) {
            return logAndRespond(res, 'Clave (member), (customer) o (task) no encontrada en el cuerpo de la solicitud', 400);
        }

        // Respuesta a la solicitud realizada
        logAndRespond(res, 'Solicitud procesada correctamente', 200);     

        // Procesar data y generar path de URL
        const { _id: memberId, externalId, app } = member;
        const wz_id = await consultRecordWz(memberId, externalId, app);
        const cel = parseInt(wz_id.externalId.substring(2));
        const { id: contact } = await consultContactByCelAndCustomer(cel, customer);
        const createRequestWzRecord = await createRequestWz(wz_id.id, customer, task, contact);
        const requestWzRecord = await consultRequestWz(createRequestWzRecord);
        const token = generateToken(requestWzRecord.id, null, null);

        // Identificar que tarea es la solicitada a traves de whatsapp
        const { nombre: taskName } = await consultTask(task);

        // Identificar el tipo de tarea que fue solicitada a traves de whatsapp
        const taskPaths = {
            [entryOrder]: 'orden-ingreso',
            [employeeWithdrawalMarking]: 'marcacion-retiro'
        };

        const path = taskPaths[taskName] ? `${taskPaths[taskName]}${createURLWithToken(token)}` : '';

        // Redireccionar al cliente al nodo donde se envia el path de la url para gestionar la solicitud
        const response = await redirectWoztellByMemberId(process.env.WZ_NODE_RESPONSE_TASK, wz_id.memberId, {
            request: requestWzRecord.id,
            path: path
        });

        // Registrar la solicitud en el reporte de actividades de WhatsApp en Zoho Creator
        if(response)
        {
            const messageData = {
                contactId: requestWzRecord.contacto_id,
                request: taskName,
                type: 'Entrada',
                description: `El cliente solicito ${taskName} a traves de whatsapp`,
                whatsappMemberId: response.member,
                requestStatus: '1'
            };
    
            await logWhatsAppCustomerMessages(messageData);
        }

    } catch (error) {
        console.error('Error en la consulta de la tarea del bot:', error);
        const errorResponse = createErrorResponse('Error interno del servidor', 500);
        res.status(errorResponse.statusCode).json(errorResponse);
    }
}

// Controlador para crear los path de las tareas del cliente que solicito a traves de whatsapp
const requestsController = { responseRequest };
export default requestsController;