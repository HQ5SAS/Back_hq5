import { wzRecordExistsByMemberId, wzRecordInsert, wzRecordExistsById } from '../Database/wz.query.js';
import { createErrorResponse } from '../Tools/utils.js';

// Funcion para consultar registros en la tabla wz, y si no existe los crea en la tabla wz por su memberId, externalId, app (member_id, external_id, app)
export async function consultRecordWz(memberId, externalId, app) {
    try {
        const response = await wzRecordExistsByMemberId(memberId);

        if (!response.exists) {
            const insertRecord  = await wzRecordInsert(memberId, externalId, app);

            if (!insertRecord  || !insertRecord.id) {
                throw new Error('Error al insertar un registro en la tabla wz');
            }

            return await wzRecordExistsById(insertRecord.id);
        }

        return response;

    } catch (error) {
        console.error('Error al obtener registro en wz por ID', error);
        throw createErrorResponse('Error al obtener registro en wz por ID', 400);
    }
}

// Funcion para consultar registros en la tabla de wz por su id (zh_id)
export async function consultRecordWzById(id) {
    try {
        return await wzRecordExistsById(id);

    } catch (error) {
        console.error('Error al obtener registro en wz por ID', error);
        throw createErrorResponse('Error al obtener registro en wz por ID', 400);
    }
}