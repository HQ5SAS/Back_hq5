import { createErrorResponse, createCustomersResponse } from '../../Tools/utils.js';

async function logAndRespond(res, message, statusCode, data = null) {
    const response = createCustomersResponse(message, statusCode, data);
    res.status(statusCode).json(response);
    return response;
}

async function confirmEntryOrderCustomer(req, res) {
    try {
        logAndRespond(res, 'Solicitud procesada correctamente', 200);
        return;

    } catch (error) {
        console.error('Error en la confirmacion de WhatsApp para la orden de ingreso', error);
        const errorResponse = createErrorResponse('Error interno del servidor', 500);
        res.status(errorResponse.statusCode).json(errorResponse);
    }
}

async function supportEntryOrderCustomer(req, res) {
    try {
        logAndRespond(res, 'Solicitud procesada correctamente', 200);
        return;

    } catch (error) {
        console.error('Error en la confirmacion de WhatsApp para la orden de ingreso', error);
        const errorResponse = createErrorResponse('Error interno del servidor', 500);
        res.status(errorResponse.statusCode).json(errorResponse);
    }
}

const requestsController = { confirmEntryOrderCustomer, supportEntryOrderCustomer };
export default requestsController;
