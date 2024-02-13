import { createErrorResponse, createCustomersResponse } from '../../Tools/utils.js';
import { entryOrder } from '../../Tools/taskName.js';
import { consultTask } from '../../Lib/functionsForm.js';
import { getFieldValue } from './entryOrderController.js';

async function logAndRespond(res, message, statusCode, data = null) {
    const response = createCustomersResponse(message, statusCode, data);
    res.status(statusCode).json(response);
    return response;
}

async function processForm(req, res) {
    try {
        const { customer, task } = req.body;
        if (!customer || !task) {
            return logAndRespond(res, 'Clave (customer) o (task) no encontrada en el cuerpo de la solicitud', 400);
        }

        // Por ahora
        logAndRespond(res, "ok", 200);

        // Consultar el tipo de tarea para ejecutar su controller
        const taskRecord = await consultTask(task);
        const { nombre: taskName } = taskRecord;
        if(taskName == entryOrder)
        {
            const fieldsValues = getFieldValue(customer);
        }
        else
        {
            console.log("No");
        }

    } catch (error) {
        console.error('Error al obtener los valores para el formulario web:', error);
        const errorResponse = createErrorResponse('Error interno del servidor', 500);
        return res.status(errorResponse.statusCode).json(errorResponse);
    }
}

const requestsController = { processForm };
export default requestsController;