import { dbConnection } from './connection.js';

// Función para verificar si existe un registro en la tabla grupo por categoria del grupo
export const groupRecordExistsByGroup = () => {
    return new Promise((resolve, reject) => {
        const sqlQuery = 'SELECT id AS id2, CONVERT(zh_id, CHAR) AS id, nombre AS nombre FROM grupo WHERE LEFT(nombre, 1) IN (\'E\', \'F\', \'G\')';
  
        dbConnection.query(sqlQuery, [], (results, fields) => {
            if (results) {
                resolve(results);
            } else {
                reject('Error en la consulta de: groupRecordExistsByGroup');
            }
        });
    });
};