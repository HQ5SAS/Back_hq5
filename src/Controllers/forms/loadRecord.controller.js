import { createErrorResponse, createCustomersResponse } from '../../Tools/utils.js';
import { entryOrder } from '../../Tools/taskName.js';
import { consultTask } from '../../Lib/form.function.js';
import { consultRequestWz } from '../../Lib/task.function.js';
import { consultRecordWzById } from '../../Lib/wz.function.js';
import { consultContactByCel } from '../../Lib/contact.function.js';
import { getFieldValueCreate, getFieldValueEdit } from '../../Lib/EntryOrder/entryOrderLoad.function.js';

// Funcion para acceder al metodo de respuesta estandar en utils.js
async function logAndRespond(res, message, statusCode, data = null) {
    const response = createCustomersResponse(message, statusCode, data);
    res.status(statusCode).json(response);
    return response;
}

// Funcion para responder la solicitud con los valores del formulario
function respondWithFieldsValues(res, fieldsValues) {
    if (fieldsValues === null) {
        return logAndRespond(res, "Error en el proceso", 400);
    }
    return logAndRespond(res, "Solicitud completada", 200, fieldsValues);
}

// Funcion para procesar el load form del frontend (Send data)
async function processForm(req, res) {
    try {

        const { requestId, taskId, recordId } = req.decoded;

        if (!requestId) {
            const { nombre: taskName } = await consultTask(taskId);

            if (taskName === entryOrder) {
                const fieldsValues = await getFieldValueEdit(recordId);
                return respondWithFieldsValues(res, fieldsValues);
            }

        } else {
            const requestRecord = await consultRequestWz(requestId);
            const wzRecord = await consultRecordWzById(requestRecord.wz_id);
            const contact = await consultContactByCel(parseInt(wzRecord.externalId.substring(2)));

            const { nombre: taskName } = await consultTask(requestRecord.tarea_id);

            if (taskName === entryOrder) {
                const fieldsValues = await getFieldValueCreate(requestRecord.cliente_id, contact[0].id);
                return respondWithFieldsValues(res, fieldsValues);
            }
        }

    } catch (error) {
        console.error('Error al obtener los valores para el formulario web:', error);
        const errorResponse = createErrorResponse('Error interno del servidor', 500);
        return res.status(errorResponse.statusCode).json(errorResponse);
    }
}

// Controlador para procesar los datos del frontend en la carga del formulario (Solicitud de datos)
const requestsController = { processForm };
export default requestsController;