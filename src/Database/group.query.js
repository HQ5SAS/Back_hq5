import { dbConnection } from './connection.js';

// Función para verificar si existe un registro en la tabla grupo por categoría del grupo
export const groupRecordExistsByGroup = async () => {
    try {
        const { results } = await dbConnection.query('SELECT id AS id2, CAST(zh_id AS CHAR) AS id, nombre FROM grupo WHERE LEFT(nombre, 1) IN (?, ?, ?)', ['E', 'F', 'G']);

        if (results) {
            return results;
        } else {
            throw new Error('Error en la consulta de: groupRecordExistsByGroup');
        }
    } catch (error) {
        console.error('Error en la consulta de: groupRecordExistsByGroup', error);
        throw error;
    }
};
