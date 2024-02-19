import { dbConnection } from './connection.js';

// Función para verificar si existe un registro en la tabla tarea_bot
export const taskRecordExistsById = (taskId) => {
    return new Promise((resolve, reject) => {
        const sqlQuery = 'SELECT id, CONVERT(zh_id, CHAR) AS zh_id, nombre FROM tarea_bot WHERE zh_id = ? LIMIT 1';
  
        dbConnection.query(sqlQuery, [taskId], (results, fields) => {
            if (results.length === 0) {
                resolve({ exists: false, id: null, nombre: null });
            } else {
                const recordId = results[0].zh_id;
                const recordNombre = results[0].nombre;
                resolve({ exists: true, id: recordId, nombre: recordNombre});
            }
        });
    });
};