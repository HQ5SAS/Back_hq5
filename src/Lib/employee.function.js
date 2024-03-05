import { employeeRecordExistsByCustomerAndState, employeeRecordExistsById } from '../Database/employee.query.js';
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

// Funcion para consultar registros en la tabla empleado por customerId (zh_cliente) y workerState (estado_trabajador)
export async function consultEmployeeByCustomerAndState(customerId, workerState) {
    try {
        return await employeeRecordExistsByCustomerAndState(customerId, workerState);

    } catch (error) {
        console.error('Error al consultar los empleados por id cliente y estado trabajador:', error);
        throw createErrorResponse('Error al consultar los empleados por id cliente y estado trabajador', 400);
    }
}