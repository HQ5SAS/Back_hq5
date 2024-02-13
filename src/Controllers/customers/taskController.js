import * as functionsTask from '../../Lib/functionsTask.js';
import * as functionsWoztell from '../../Lib/functionsWoztell.js';
import { createErrorResponse, createCustomersResponse, createURLWithIdCustomerIdTask, shortenUrl, generateToken } from '../../Tools/utils.js';
import { redirectMemberToNode } from '../../Tools/woztell.js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

async function logAndRespond(res, message, statusCode, data = null) {
    const response = createCustomersResponse(message, statusCode, data);
    res.status(statusCode).json(response);
    return response;
}

async function responseRequest(req, res) {
    try {
        const { member, customer, task } = req.body;

        if (!member || !customer || !task) {
            return logAndRespond(res, 'Clave (member), (customer) o (task) no encontrada en el cuerpo de la solicitud', 400);
        }

        logAndRespond(res, 'Solicitud procesada correctamente', 200);        

        const { _id: id, externalId, app } = member;
        const wz_id = await functionsWoztell.consultRecordWz(id, externalId, app);
        const createRequestWzRecord = await functionsTask.createRequestWz(wz_id.id, customer, task);
        const requestWzRecord = await functionsTask.consultRequestWz(createRequestWzRecord);

        const token = generateToken();
        const url = createURLWithIdCustomerIdTask(requestWzRecord.cliente_id, requestWzRecord.tarea_id, token);
        const message = "";

        // Falta completar la funcion de acortador de URL
        //const encodedUrl = shortenUrl("Orden de ingreso",url);

        redirectMemberToNode(process.env.WZ_NODE_RESPONSE_TASK, wz_id.memberId, null, {
            customer: customer,
            task: task,
            request: requestWzRecord.id,
            url: url,
            message: message
        });
        return;

    } catch (error) {
        console.error('Error en la consulta de la tarea de orden de ingreso:', error);
        const errorResponse = createErrorResponse('Error interno del servidor', 500);
        res.status(errorResponse.statusCode).json(errorResponse);
    }
}

const requestsController = { responseRequest };
export default requestsController;