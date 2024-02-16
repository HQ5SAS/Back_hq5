import * as wzQuery from '../Database/wz.query.js';
import { createErrorResponse } from '../Tools/utils.js';

export async function consultRecordWz(memberId, externalId, app) {
    try {
        const response = await wzQuery.wzRecordExistsByMemberId(memberId);

        if (!response.exists) {

            try {
                const insert = await wzQuery.wzRecordInsert(memberId, externalId, app);
                if (!insert || !insert.id) {
                    throw new Error('Error en la inserción de registros en wz');
                }
                const response = await wzQuery.wzRecordExistsById(insert.id);
                return response;

            } catch (error) {
                throw error;
            }
            
        } else {
            return response;   
        }

    } catch (error) {
        console.error('Error al obtener registro en wz por ID', error);
        throw createErrorResponse('Error al obtener registro en wz por ID', 400);
    }
}