import { createRequestWz, consultRequestWz } from '../../Lib/task.function.js';
import { consultRecordWz } from '../../Lib/wz.function.js';
import { createErrorResponse, createCustomersResponse, createURLWithToken, generateToken } from '../../Tools/utils.js';
import { redirectMemberToNode } from '../../Tools/woztell.js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

// Funcion para acceder al metodo de respuesta estandar en utils.js
async function logAndRespond(res, message, statusCode, data = null) {
    const response = createCustomersResponse(message, statusCode, data);
    res.status(statusCode).json(response);
    return response;
}

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
        const createRequestWzRecord = await createRequestWz(wz_id.id, customer, task);
        const requestWzRecord = await consultRequestWz(createRequestWzRecord);
        const token = generateToken(requestWzRecord.id, null, null);
        const path = createURLWithToken(token);
        const message = "";

        // Redireccionar al cliente al nodo donde se envia el path de la url para gestionar la solicitud
        redirectMemberToNode(process.env.WZ_NODE_RESPONSE_TASK, wz_id.memberId, null, {
            customer: customer,
            task: task,
            request: requestWzRecord.id,
            url: "",
            path: path,
            message: message
        });

    } catch (error) {
        console.error('Error en la consulta de la tarea de orden de ingreso:', error);
        const errorResponse = createErrorResponse('Error interno del servidor', 500);
        res.status(errorResponse.statusCode).json(errorResponse);
    }
}

// Controlador para crear los path de las tareas del cliente que solicito a traves de whatsapp
const requestsController = { responseRequest };
export default requestsController;