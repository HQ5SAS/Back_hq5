import * as queryWz from '../Database/querysWz.js';
import * as queryCustomer from '../Database/querysCustomer.js';
import * as queryTask from '../Database/queysTask.js';
import * as queryRequestWz from '../Database/querysRequestWz.js';
import { createErrorResponse } from '../Tools/utils.js';

export async function createRequestWz(memberId, customerId, taskId) {
    try {
        const [wzRecord, customerRecord, taskRecord] = await Promise.all([
            queryWz.wzRecordExistsByMemberId(memberId),
            queryCustomer.customerRecordExistsById(customerId),
            queryTask.taskRecordExistsById(taskId),
        ]);

        const { exists, id } = await queryRequestWz.requestWzRecordExists(wzRecord.id, customerRecord.id, taskRecord.id);

        if (!exists) {
            const { id } = await queryRequestWz.requestWzRecordInsert(wzRecord.id, customerRecord.id, taskRecord.id);
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
        const results = await queryRequestWz.requestWzRecordExistsById(idWzRecord);
        return results;

    } catch (error) {
        console.error('Error al obtener solicitud_wz por el id:', error);
        throw createErrorResponse('Error al obtener solicitud_wz por el id', 400);
    }
}