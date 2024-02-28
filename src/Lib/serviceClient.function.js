import { permitRecordExistsByClient } from '../Database/permit.quey.js';
import { createErrorResponse } from '../Tools/utils.js';

// Funcion para consultar un registro en la tabla permiso por su cel y customerId (celular, zh_cliente)
export async function consultPermissionClient(cel, customerId) {
    try {
        return await permitRecordExistsByClient(cel, customerId);
        
    } catch (error) {
        console.error('Error al obtener permisos por cliente y número de celular:', error);
        throw createErrorResponse('Error al obtener permisos por cliente y número de celular', 400);
    }
}