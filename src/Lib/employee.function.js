import { employeeRecordExistsById } from '../Database/employee.query.js';
import { createErrorResponse } from '../Tools/utils.js';

// Funcion para consultar un registro en la tabla empleado por su id (zh_id)
export async function consultEmployee(employeeId) {
    try {
        return await employeeRecordExistsById(employeeId);

    } catch (error) {
        console.error('Error al consultar el empleado por su id:', error);
        throw createErrorResponse('Error al consultar el empleado por su id', 400);
    }
}