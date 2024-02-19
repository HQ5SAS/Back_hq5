import { dbConnection } from './connection.js';

// Función para verificar si existe un concepto en la tabla concepto por id grupo y esta marcado como valido
export const conceptRecordExistsByIdGroup = (groupId) => {
    return new Promise((resolve, reject) => {
        const sqlQuery = 'SELECT id AS id2, CONVERT(zh_id, CHAR) AS id, nombre AS nombre FROM concepto WHERE zh_grupo = ? AND valido = 1';
  
        dbConnection.query(sqlQuery, [groupId], (results, fields) => {
            if (results) {
                resolve(results);
            } else {
                reject('Error en la consulta de: conceptRecordExistsByIdGroup');
            }
        });
    });
};