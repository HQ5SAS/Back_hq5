import { createErrorResponse, createCustomersResponse } from '../../Tools/utils.js';
import { entryOrder } from '../../Tools/taskName.js';
import { consultTask } from '../../Lib/form.function.js';
import { consultRequestWz } from '../../Lib/task.function.js';
import { consultRecordWzById } from '../../Lib/wz.function.js';
import { consultContactByCel } from '../../Lib/contact.function.js';
import { getFieldValueCreate } from '../../Lib/EntryOrder/entryOrderGet.function.js';
import { getFieldValueEdit } from '../../Lib/EntryOrder/entryOrderGet.function.js';

async function logAndRespond(res, message, statusCode, data = null) {
    const response = createCustomersResponse(message, statusCode, data);
    res.status(statusCode).json(response);
    return response;
}

async function processForm(req, res) {
    try {

        if(req.decoded.requestId === null || req.decoded.requestId === undefined)
        {
            // const { record, task } = req.query;
            // const requiredParams = ['record', 'task'];
            // const missingParams = requiredParams.filter(param => !req.query[param]);
    
            // if (missingParams.length > 0) {
            // return logAndRespond(res, `Faltan parámetros obligatorios: ${missingParams.join(', ')}`, 400);
            // }
    
            const taskRecord = await consultTask(req.decoded.taskId);
            const { nombre: taskName } = taskRecord;
    
            if (taskName === entryOrder) {
                
                const fieldsValues = await getFieldValueEdit(req.decoded.recordId);
    
                if (fieldsValues === null) {
                    return logAndRespond(res, "Error en el proceso", 400);
                }
    
                return logAndRespond(res, "Solicitud completada", 200, fieldsValues);
            }
        }
        else{
            // Validar contenido de la solicitud
            // const { customer, task, contact } = req.query;
            // const requiredParams = ['customer', 'task', 'contact'];
            // const missingParams = requiredParams.filter(param => !req.query[param]);
    
            // if (missingParams.length > 0) {
            // return logAndRespond(res, `Faltan parámetros obligatorios: ${missingParams.join(', ')}`, 400);
            // }
            const requestRecord = await consultRequestWz(req.decoded.requestId);
            const wzRecord = await consultRecordWzById(requestRecord.wz_id);
            const cel = parseInt(wzRecord.externalId.substring(2));
            const contact = await consultContactByCel(cel);
    
            // Pendiente de aca en adelante validar lo de las solicitudes ...
            //const recordContact = await contactFunction.consultContactByCel(cel);
    
            const taskRecord = await consultTask(requestRecord.tarea_id);
            const { nombre: taskName } = taskRecord;
    
            if (taskName === entryOrder) {
    
                // El contact que se recibe en las query es el id de la tabla contacto
                const fieldsValues = await getFieldValueCreate(requestRecord.cliente_id, contact[0].id);
    
                if (fieldsValues === null) {
                    return logAndRespond(res, "Error en el proceso", 400);
                }
    
                return logAndRespond(res, "Solicitud completada", 200, fieldsValues);
            }
        }

    } catch (error) {
        console.error('Error al obtener los valores para el formulario web:', error);
        const errorResponse = createErrorResponse('Error interno del servidor', 500);
        return res.status(errorResponse.statusCode).json(errorResponse);
    }
}

const requestsController = { processForm };
export default requestsController;