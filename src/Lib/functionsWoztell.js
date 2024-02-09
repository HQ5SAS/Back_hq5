import * as queryWz from '../Database/querysWz.js';
import { createErrorResponse } from '../Tools/utils.js';

export async function consultRecordWz(id, externalId, app) {
    try {
        const response = await queryWz.wzRecordExistsByMemberId(id);

        if (!response) {
            await queryWz.beginTransaction();

            try {
                const insert = await queryWz.wzRecordInsert(id, externalId, app);
                const consult = await queryWz.wzRecordExistsByMemberId(insert.id);
                await queryWz.commitTransaction();
                return consult;

            } catch (insertError) {
                await queryWz.rollbackTransaction();
                throw insertError;
            }
            
        } else {
            return response;   
        }

    } catch (error) {
        console.error('Error al obtener registro en wz por ID', error);
        throw createErrorResponse('Error al obtener registro en wz por ID', 400);
    }
}