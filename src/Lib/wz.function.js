import * as wzQuery from '../Database/wz.query.js';
import { createErrorResponse } from '../Tools/utils.js';

// Optimizado

// Funcion para consultar registros de Woztell y si existe los crea en la tabla wz de la db HQ5
export async function consultRecordWz(memberId, externalId, app) {
    try {
        const response = await wzQuery.wzRecordExistsByMemberId(memberId);

        if (!response.exists) {
            const insertRecord  = await wzQuery.wzRecordInsert(memberId, externalId, app);

            if (!insertRecord  || !insertRecord.id) {
                throw new Error('Error al insertar un registro en la tabla wz');
            }

            return await wzQuery.wzRecordExistsById(insertRecord.id);
        }

        return response;

    } catch (error) {
        console.error('Error al obtener registro en wz por ID', error);
        throw createErrorResponse('Error al obtener registro en wz por ID', 400);
    }
}

// Funcion para consultar registros de Woztell en la tabla wz de la db HQ5
export async function consultRecordWzById(id) {
    try {
        return await wzQuery.wzRecordExistsById(id);

    } catch (error) {
        console.error('Error al obtener registro en wz por ID', error);
        throw createErrorResponse('Error al obtener registro en wz por ID', 400);
    }
}