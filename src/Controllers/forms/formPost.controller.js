import { createErrorResponse, createCustomersResponse } from '../../Tools/utils.js';
import { setFieldsValue } from '../../Lib/EntryOrder/entryOrderPost.function.js';

async function logAndRespond(res, message, statusCode, data = null) {
    const response = createCustomersResponse(message, statusCode, data);
    res.status(statusCode).json(response);
    return response;
}

async function processForm(req, res) {
    try {
        const requestBody = req.body;
        const data = requestBody.data;

        if (!data) {
            return logAndRespond(res, "El formato de la solicitud no es válido", 400);
        }

        // Validar el tipo de formulario (Orden ingreso)
        if(requestBody.data.orden_ingreso)
        {
            const response = await setFieldsValue(requestBody);
            const records = response.data;
            // Insertar registros en Zoho ... Aplica para las prediligenciadas y las no prediligenciadas
            // Insertar orden de ingreso masivo
            // Insertar beneficios de contrato
            return logAndRespond(res, response.message, response.status, response.data);
        }

    } catch (error) {
        console.error('Error al cargar los valores para el formulario web en zoho:', error);
        const errorResponse = createErrorResponse('Error interno del servidor', 500);
        return res.status(errorResponse.statusCode).json(errorResponse);
    }
}

const requestsController = { processForm };
export default requestsController;