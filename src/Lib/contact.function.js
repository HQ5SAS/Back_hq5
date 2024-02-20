import * as permitQuery from '../Database/permit.quey.js';
import * as contactQuery from '../Database/contact.query.js';
import { createErrorResponse } from '../Tools/utils.js';

export async function consultContact(cel, wzId) {
    try {
        const response = await contactQuery.contactRecordExistsByCel(cel);
        
        for (const contact of response) {
            await contactQuery.updateContactWzIdById(contact.id, wzId);
        }

        return response;

    } catch (error) {
        console.error('Error al obtener contacto por número de celular:', error);
        throw createErrorResponse('Error al obtener contacto por número de celular', 400);
    }
}

export async function consultPermission(contactId) {
    try {
        const response = await permitQuery.permitRecordExistsByContact(contactId);
        return response;
        
    } catch (error) {
        console.error('Error al obtener permisos por contacto:', error);
        throw createErrorResponse('Error al obtener permisos por contacto', 400);
    }
}