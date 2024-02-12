import * as queryPermit from '../Database/queryPermit.js';
import * as queryContact from '../Database/querysContact.js';
import { createErrorResponse } from '../Tools/utils.js';

export async function consultContact(cel) {
    try {
        const response = await queryContact.contactRecordExistsByCel(cel);
        return response;

    } catch (error) {
        console.error('Error al obtener contacto por número de celular:', error);
        throw createErrorResponse('Error al obtener contacto por número de celular', 400);
    }
}

export async function consultPermission(contactId) {
    try {
        const response = await queryPermit.permitRecordExistsByContact(contactId);
        return response;
        
    } catch (error) {
        console.error('Error al obtener permisos por contacto:', error);
        throw createErrorResponse('Error al obtener permisos por contacto', 400);
    }
}