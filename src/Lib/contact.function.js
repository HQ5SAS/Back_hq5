import { contactRecordExistsByCel, updateContactWzIdById, contactRecordExistsById, contactRecordExistsByIdAndCustomer } from '../Database/contact.query.js';
import { createErrorResponse } from '../Tools/utils.js';

// Funcion para consultar registros en la tabla contacto por su cel y wzId (celular, fk_wz_id) y los actualiza con su registro en la tabla wz
export async function consultContact(cel, wzId) {
    try {
        const response = await contactRecordExistsByCel(cel);
        
        for (const contact of response) {
            await updateContactWzIdById(contact.id, wzId);
        }

        return response;

    } catch (error) {
        console.error('Error al obtener contacto por número de celular y woztell id:', error);
        throw createErrorResponse('Error al obtener contacto por número de celular y woztell id', 400);
    }
}

// Funcion para consultar registros en la tabla contacto por su celular (celular)
export async function consultContactByCel(cel) {
    try {
        return await contactRecordExistsByCel(cel);

    } catch (error) {
        console.error('Error al obtener contacto por número de celular:', error);
        throw createErrorResponse('Error al obtener contacto por número de celular', 400);
    }
}

// Funcion para consultar registros en la tabla contacto por contactId (zh_id)
export async function consultContactById(contactId) {
    try {
        return await contactRecordExistsById(contactId);

    } catch (error) {
        console.error('Error al obtener contacto por id:', error);
        throw createErrorResponse('Error al obtener contacto id', 400);
    }
}

// Funcion para consultar registros en la tabla contacto por su celular (celular) y cliente (zh_cliente)
export async function consultContactByCelAndCustomer(cel, customerId) {
    try {
        return await contactRecordExistsByIdAndCustomer(cel, customerId);

    } catch (error) {
        console.error('Error al obtener contacto por número de celular y id cliente:', error);
        throw createErrorResponse('Error al obtener contacto por número de celular y id cliente', 400);
    }
}