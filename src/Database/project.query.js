import { dbConnection } from './connection.js';

// Función para verificar si existe un registro en la tabla proyecto por id cliente
export const projectRecordExistsByIdCustomer = (customerId) => {
    return new Promise((resolve, reject) => {
        const sqlQuery = 'SELECT id AS id2, CONVERT(zh_id, CHAR) AS id, nombre AS nombre FROM proyecto WHERE zh_cliente = ?';
  
        dbConnection.query(sqlQuery, [customerId], (results, fields) => {
            if (results) {
                resolve(results);
            } else {
                reject('Error en la consulta de: projectRecordExistsByIdCustomer');
            }
        });
    });
};