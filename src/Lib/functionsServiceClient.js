import * as queryPermit from '../Database/queryPermit.js';
import { createErrorResponse } from '../Tools/utils.js';

export async function consultPermissionClient(cel, customer) {
    try {
        const results = await queryPermit.permitRecordExistsByClient(cel, customer);
        return results;
        
    } catch (error) {
        console.error('Error al obtener permisos por cliente y número de celular:', error);
        throw createErrorResponse('Error al obtener permisos por cliente y número de celular', 400);
    }
}