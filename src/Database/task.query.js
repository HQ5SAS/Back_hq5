import { dbConnection } from './connection.js';

// Función para verificar si existe un registro en la tabla tarea_bot por taskId (zh_id)
export const taskRecordExistsById = async (taskId) => {
    try {
        const { results } = await dbConnection.query(`
            SELECT 
                id AS id2, 
                CAST(zh_id AS CHAR) AS id, 
                nombre AS nombre
            FROM 
                tarea_bot 
            WHERE 
                zh_id = ? 
            LIMIT 
                1
        `, [taskId]);

        return results.length === 0
            ? { exists: false, id: null, nombre: null }
            : { exists: true, id: results[0].id, nombre: results[0].nombre };

    } catch (error) {
        console.error('Error en la consulta de: taskRecordExistsById', error);
        throw error;
    }
};

// Función para verificar si existe un registro en la tabla tarea_bot por taskName (nombre)
export const taskRecordExistsByName = async (taskName) => {
    try {
        const { results } = await dbConnection.query(`
            SELECT 
                id AS id2,
                CAST(zh_id AS CHAR) AS id,
                nombre AS nombre
            FROM 
                tarea_bot 
            WHERE 
                nombre = ? 
            LIMIT 
                1
        `, [taskName]);

        return results.length === 0
            ? { exists: false, id: null, nombre: null }
            : { exists: true, id: results[0].id, nombre: results[0].nombre };

    } catch (error) {
        console.error('Error en la consulta de: taskRecordExistsByName', error);
        throw error;
    }
};