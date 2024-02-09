import { dbConnection } from '../Database/connection.js';

// Función para verificar si existe un registro en la tabla cliente
export const customerRecordExistsById = (id) => {
    return new Promise((resolve, reject) => {
        const sqlQuery = 'SELECT id, cliente FROM cliente WHERE id = ? LIMIT 1';
  
        dbConnection.query(sqlQuery, [id], (results, fields) => {
            if (results.length === 0) {
                resolve({ exists: false, id: null, customer: null });
            } else {
                const recordId = results[0].id;
                const recordCustomer = results[0].cliente;
                resolve({ exists: true, id: recordId, customer: recordCustomer});
            }
        });
    });
};