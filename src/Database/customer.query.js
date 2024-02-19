import { dbConnection } from '../Database/connection.js';

// Función para verificar si existe un registro en la tabla cliente
export const customerRecordExistsById = (customerId) => {
    return new Promise((resolve, reject) => {
        const sqlQuery = 'SELECT id, CONVERT(zh_id, CHAR) AS zh_id, cliente FROM cliente WHERE zh_id = ? LIMIT 1';
  
        dbConnection.query(sqlQuery, [customerId], (results, fields) => {
            if (results.length === 0) {
                resolve({ exists: false, id: null, customer: null });
            } else {
                const recordId = results[0].zh_id;
                const recordCustomer = results[0].cliente;
                resolve({ exists: true, id: recordId, customer: recordCustomer});
            }
        });
    });
};