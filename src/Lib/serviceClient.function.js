import * as permitQuery from '../Database/permit.quey.js';
import { createErrorResponse } from '../Tools/utils.js';

export async function consultPermissionClient(cel, customer) {
    try {
        const response = await permitQuery.permitRecordExistsByClient(cel, customer);
        return response;
        
    } catch (error) {
        console.error('Error al obtener permisos por cliente y número de celular:', error);
        throw createErrorResponse('Error al obtener permisos por cliente y número de celular', 400);
    }
}