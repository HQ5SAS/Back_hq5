import * as taskQuery from '../Database/task.query.js';
import { createErrorResponse } from '../Tools/utils.js';

export async function consultTask(taskId) {
    try {
        const response = await taskQuery.taskRecordExistsById(taskId);
        return response;

    } catch (error) {
        console.error('Error al consultar la tarea por zh_id:', error);
        throw createErrorResponse('Error al consultar la tarea por zh_id', 400);
    }
}