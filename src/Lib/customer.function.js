import { customerRecordExistsById } from '../Database/customer.query.js';
import { createErrorResponse } from '../Tools/utils.js';

// Funcion para consultar un registro en la tabla cliente por su id (zh_id)
export async function consultCustomer(customerId) {
    try {
        return await customerRecordExistsById(customerId);

    } catch (error) {
        console.error('Error al consultar el cliente por su id:', error);
        throw createErrorResponse('Error al consultar el cliente por su id', 400);
    }
}