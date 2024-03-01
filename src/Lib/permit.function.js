import { permitRecordExistsByContact, permitRecordExistsByClient } from '../Database/permit.quey.js';
import { createErrorResponse } from '../Tools/utils.js';

// Funcion para consultar registros en la tabla permiso por su contactId (zh_contacto)
export async function consultPermission(contactId) {
    try {
        return await permitRecordExistsByContact(contactId);
        
    } catch (error) {
        console.error('Error al obtener permisos por contacto:', error);
        throw createErrorResponse('Error al obtener permisos por contacto', 400);
    }
}

// Funcion para consultar un registro en la tabla permiso por su cel y customerId (celular, zh_cliente)
export async function consultPermissionClient(cel, customerId) {
    try {
        return await permitRecordExistsByClient(cel, customerId);
        
    } catch (error) {
        console.error('Error al obtener permisos por cliente y número de celular:', error);
        throw createErrorResponse('Error al obtener permisos por cliente y número de celular', 400);
    }
}