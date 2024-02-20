import { dbConnection } from './connection.js';

// OK

// Función para verificar si existe un registro en la tabla tarea_bot
export const taskRecordExistsById = async (taskId) => {
    try {
        const { results } = await dbConnection.query('SELECT id, CAST(zh_id AS CHAR) AS zh_id, nombre FROM tarea_bot WHERE zh_id = ? LIMIT 1', [taskId]);

        if (results.length === 0) {
            return { exists: false, id: null, nombre: null };
        } else {
            const recordId = results[0].zh_id;
            const recordNombre = results[0].nombre;
            return { exists: true, id: recordId, nombre: recordNombre };
        }
    } catch (error) {
        console.error('Error en la consulta de: taskRecordExistsById', error);
        throw error;
    }
};
