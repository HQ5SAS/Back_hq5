import { consultCustomer } from '../customer.function.js';
import { consultEmployee } from '../employee.function.js';

export const getOperationManager = async (contactRecord) => {
    const customerRecord = await consultCustomer(contactRecord.id_cliente);
    const employeeRecord = customerRecord.exists ? await consultEmployee(customerRecord.managerId) : null;
    const nameManager = employeeRecord ? `*Nombre:* ${employeeRecord.nombre} ${employeeRecord.apellido}` : '';
    const cellPhoneManager = employeeRecord ? `*Celular:* ${employeeRecord.celular_corp}` : '';
    const operationManager = nameManager || cellPhoneManager ? `\n${nameManager}\n${cellPhoneManager}` : '';
    
    return {
        nameContact: contactRecord.nombre,
        operationManager: operationManager
    };
}
