import * as queryWz from '../Database/querysWz.js';
import { createErrorResponse } from '../Tools/utils.js';

export async function consultRecordWz(id, externalId, app) {
    try {
        const response = await queryWz.wzRecordExistsByMemberId(id);

        if (!response.exists) {

            try {
                const insert = await queryWz.wzRecordInsert(id, externalId, app);
                if (!insert || !insert.id) {
                    throw new Error('Error en la inserción de registros en wz');
                }
                const consult = await queryWz.wzRecordExistsById(insert.id);
                return consult;

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