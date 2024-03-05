import { createErrorResponse, logAndRespond } from '../../Tools/utils.js';
import { nameEntryOrder, nameWithdrawall } from '../../Tools/taskName.js';
import { consultTask } from '../../Lib/task.function.js';
import { consultRequestWz } from '../../Lib/requestWz.function.js';
import { EMP_STATE_ACT } from '../../Database/fields.js';
import * as entryOrderLoad from '../../Lib/EntryOrder/entryOrderLoad.function.js';
import * as withdrawallLoad from '../../Lib/Withdrawall/withdrawallLoad.function.js';

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

            if (taskName === nameEntryOrder) {
                const fieldsValues = await entryOrderLoad.getFieldValueEdit(recordId);
                return respondWithFieldsValues(res, fieldsValues);
            }

        } else {
            const requestRecord = await consultRequestWz(requestId);
            const { nombre: taskName } = await consultTask(requestRecord.tarea_id);

            // Funciones de consulta de valores de los campos del formulario del frontend
            const handleEntryOrder = async () => {
                const fieldsValues = await entryOrderLoad.getFieldValueCreate(requestRecord.cliente_id, requestRecord.contacto_id);
                respondWithFieldsValues(res, fieldsValues);
            };
              
            const handleWithdrawall = async () => {
                const fieldsValues = await withdrawallLoad.getFieldValueCreate(requestRecord.cliente_id, requestRecord.contacto_id, EMP_STATE_ACT);
                respondWithFieldsValues(res, fieldsValues);
            };

            // Realizar acciones según la tarea
            const taskFunctions = {
                [nameEntryOrder]: handleEntryOrder,
                [nameWithdrawall]: handleWithdrawall,
            };
            
            const taskFunction = taskFunctions[taskName];
            
            if (taskFunction) {
                await taskFunction();
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