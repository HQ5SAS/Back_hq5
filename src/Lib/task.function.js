import * as wzQuery from '../Database/wz.query.js';
import * as customerQuery from '../Database/customer.query.js';
import * as taskQuery from '../Database/task.query.js';
import * as requestWzQuery from '../Database/requestWz.query.js';
import { createErrorResponse } from '../Tools/utils.js';

export async function createRequestWz(wzId, customerId, taskId) {
    try {
        const [wzRecord, customerRecord, taskRecord] = await Promise.all([
            wzQuery.wzRecordExistsById(wzId),
            customerQuery.customerRecordExistsById(customerId),
            taskQuery.taskRecordExistsById(taskId),
        ]);

        const { exists, id } = await requestWzQuery.requestWzRecordExists(wzRecord.id, customerRecord.id, taskRecord.id);

        if (!exists) {
            const { id } = await requestWzQuery.requestWzRecordInsert(wzRecord.id, customerRecord.id, taskRecord.id);
            return id;
        }

        return id;

    } catch (error) {
        console.error('Error al crear y consultar la solicitud de woztell:', error);
        throw createErrorResponse('Error al crear y consultar la solicitud de woztell', 400);
    }
}

export async function consultRequestWz(idWzRecord) {
    try {
        const response = await requestWzQuery.requestWzRecordExistsById(idWzRecord);
        return response;

    } catch (error) {
        console.error('Error al obtener solicitud_wz por el id:', error);
        throw createErrorResponse('Error al obtener solicitud_wz por el id', 400);
    }
}