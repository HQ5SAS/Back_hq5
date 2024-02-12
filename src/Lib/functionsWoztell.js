import * as queryWz from '../Database/querysWz.js';
import { createErrorResponse } from '../Tools/utils.js';

export async function consultRecordWz(memberId, externalId, app) {
    try {
        const response = await queryWz.wzRecordExistsByMemberId(memberId);

        if (!response.exists) {

            try {
                const insert = await queryWz.wzRecordInsert(memberId, externalId, app);
                if (!insert || !insert.id) {
                    throw new Error('Error en la inserción de registros en wz');
                }
                const response = await queryWz.wzRecordExistsById(insert.id);
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