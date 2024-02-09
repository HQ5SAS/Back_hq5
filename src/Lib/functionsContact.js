import * as queryPermit from '../Database/queryPermit.js';
import * as queryContact from '../Database/querysContact.js';
import { createErrorResponse } from '../Tools/utils.js';

export async function consultContact(cel) {
    try {
        const results = await queryContact.contactRecordExistsByCel(cel);
        return results;

    } catch (error) {
        console.error('Error al obtener contacto por número de celular:', error);
        throw createErrorResponse('Error al obtener contacto por número de celular', 400);
    }
}

export async function consultPermission(contact) {
    try {
        const results = await queryPermit.permitRecordExistsByContact(contact);
        return results;
        
    } catch (error) {
        console.error('Error al obtener permisos por contacto:', error);
        throw createErrorResponse('Error al obtener permisos por contacto', 400);
    }
}