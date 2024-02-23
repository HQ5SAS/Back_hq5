import * as taskFunction from '../../Lib/task.function.js';
import * as woztellFunction from '../../Lib/woztell.function.js';
import * as contactFunction from '../../Lib/contact.function.js';
import { createErrorResponse, createCustomersResponse, createURLWithIdCustomerIdTask, generateToken } from '../../Tools/utils.js';
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

        const { _id: memberId, externalId, app } = member;
        const wz_id = await woztellFunction.consultRecordWz(memberId, externalId, app);
        const cel = parseInt(wz_id.externalId.substring(2));
        const recordContact = await contactFunction.consultContactByCel(cel);
        const createRequestWzRecord = await taskFunction.createRequestWz(wz_id.id, customer, task);
        const requestWzRecord = await taskFunction.consultRequestWz(createRequestWzRecord);

        const token = generateToken();
        const path = createURLWithIdCustomerIdTask(requestWzRecord.cliente_id, requestWzRecord.tarea_id, recordContact[0].id, token);
        const message = "";

        redirectMemberToNode(process.env.WZ_NODE_RESPONSE_TASK, wz_id.memberId, null, {
            customer: customer,
            task: task,
            request: requestWzRecord.id,
            url: "",
            path: path,
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