import * as functionsTask from '../../Lib/functionsTask.js';
import { createErrorResponse, createURLWithIdTaskIdCustomer, createCustomersResponse, shortenUrl } from '../../Tools/utils.js';
import { REQ_SUCESS } from '../../Tools/process.js';

async function logAndRespond(res, message, statusCode, process = null, data = null) {
    const response = createCustomersResponse(message, statusCode, process, data);
    res.status(statusCode).json(response);
    return response;
}

async function responseRequest(req, res) {
    try {
        const { member, customer, task } = req.body;

        if (!member || !customer || !task) {
            return logAndRespond(res, 'Clave (member), (customer) o (task) no encontrada en el cuerpo de la solicitud', 400);
        }

        const member_id = member._id;
        const createWzRecord = await functionsTask.createRequestWz(member_id, customer, task);
        const requestWzRecord = await functionsTask.consultRequestWz(createWzRecord);
        const url = createURLWithIdTaskIdCustomer(requestWzRecord.cliente_id, requestWzRecord.tarea_id);

        //const encodedUrl = shortenUrl("Orden de ingreso",url);

        const message = "Solicitud creada correctamente";

        const data = {
            customer,
            task,
            request: requestWzRecord.id,
            url,
        };

        return logAndRespond(res, message, 200, REQ_SUCESS, data);

    } catch (error) {
        console.error('Error en la consulta de la tarea de orden de ingreso:', error);
        const errorResponse = createErrorResponse('Error interno del servidor', 500);
        res.status(errorResponse.statusCode).json(errorResponse);
    }
}

const requestsController = { responseRequest };
export default requestsController;