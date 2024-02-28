import { taskRecordExistsById } from '../Database/task.query.js';
import { createErrorResponse } from '../Tools/utils.js';

// Funcion para consultar un registro en la tabla tarea_bot por su id (zh_id)
export async function consultTask(taskId) {
    try {
        return await taskRecordExistsById(taskId);

    } catch (error) {
        console.error('Error al consultar la tarea por su id:', error);
        throw createErrorResponse('Error al consultar la tarea por su id', 400);
    }
}