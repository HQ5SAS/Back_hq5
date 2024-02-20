import { dbConnection } from './connection.js';

// Función para verificar si existe un registro en la tabla perfil por zh_id en perfil
export const profileRecordExistsById = (Id) => {
    return new Promise((resolve, reject) => {
        const sqlQuery = 'SELECT id AS id2, CONVERT(zh_id, CHAR) AS id, nombre AS nombre, nivel_riesgo AS nivel_riesgo FROM perfil WHERE zh_id = ?';
  
        dbConnection.query(sqlQuery, [Id], (results, fields) => {
            if (results) {
                resolve(results);
            } else {
                reject('Error en la consulta de: profileRecordExistsById');
            }
        });
    });
};