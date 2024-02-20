import { createErrorResponse, createCustomersResponse } from '../../Tools/utils.js';
import { entryOrder } from '../../Tools/taskName.js';
import { consultTask } from '../../Lib/form.function.js';
import { getFieldValue } from './entryOrderOut.controller.js';

async function logAndRespond(res, message, statusCode, data = null) {
    const response = createCustomersResponse(message, statusCode, data);
    res.status(statusCode).json(response);
    return response;
}

async function processForm(req, res) {
    try {

        const { customer, task } = req.query;
        const requiredParams = ['customer', 'task'];
        const missingParams = requiredParams.filter(param => !req.query[param]);

        if (missingParams.length > 0) {
        return logAndRespond(res, `Faltan parámetros obligatorios: ${missingParams.join(', ')}`, 400);
        }

        const taskRecord = await consultTask(task);
        const { nombre: taskName } = taskRecord;

        if (taskName === entryOrder) {
            // Falta acceder al cliente que se recibe en la solicitud
            // Falta filtrar los postulados por su estado
            // Falta crear objeto con selecciones pre diligenciadas
            const fieldsValues = await getFieldValue(customer);

            if (fieldsValues === null) {
                return logAndRespond(res, "Error en el proceso", 400);
            }

            return logAndRespond(res, "Solicitud completada", 200, fieldsValues);
        }

    } catch (error) {
        console.error('Error al obtener los valores para el formulario web:', error);
        const errorResponse = createErrorResponse('Error interno del servidor', 500);
        return res.status(errorResponse.statusCode).json(errorResponse);
    }
}

const requestsController = { processForm };
export default requestsController;