import { dbConnection } from '../Database/connection.js';

// Función para verificar si existe un registro en la tabla tarea_bot
export const taskRecordExistsById = (id) => {
    return new Promise((resolve, reject) => {
        const sqlQuery = 'SELECT id, nombre FROM tarea_bot WHERE id = ? LIMIT 1';
  
        dbConnection.query(sqlQuery, [id], (results, fields) => {
            if (results.length === 0) {
                resolve({ exists: false, id: null, nombre: null });
            } else {
                const recordId = results[0].id;
                const recordNombre = results[0].nombre;
                resolve({ exists: true, id: recordId, nombre: recordNombre});
            }
        });
    });
};