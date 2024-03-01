import { wzRecordExistsById } from '../Database/wz.query.js';
import { customerRecordExistsById } from '../Database/customer.query.js';
import { taskRecordExistsById } from '../Database/task.query.js';
import { requestWzRecordExistsById, requestWzRecordInsert } from '../Database/requestWz.query.js';
import { createErrorResponse } from '../Tools/utils.js';

// Funcion para crear las solicitudes woztell (solicitud_wz) por wz_id, cleinte_id, tarea_bot_id
export async function createRequestWz(wzId, customerId, taskId) {
    try {
        const [
            wzRecord, 
            customerRecord, 
            taskRecord
        ] = await Promise.all([
            wzRecordExistsById(wzId),
            customerRecordExistsById(customerId),
            taskRecordExistsById(taskId),
        ]);

        const { id } = await requestWzRecordInsert(wzRecord.id, customerRecord.id, taskRecord.id);
        return id;

    } catch (error) {
        console.error('Error al crear y consultar la solicitud de woztell:', error);
        throw createErrorResponse('Error al crear y consultar la solicitud de woztell', 400);
    }
}

// Funcion para consultar un registro en la tabla solicitud_wz por id (zh_id)
export async function consultRequestWz(reqWzId) {
    try {
        return await requestWzRecordExistsById(reqWzId);

    } catch (error) {
        console.error('Error al obtener solicitud_wz por el id:', error);
        throw createErrorResponse('Error al obtener solicitud_wz por el id', 400);
    }
}