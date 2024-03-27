import { dbConnection } from './connection.js';

// Función para verificar si existe un concepto en la tabla concepto por groupId (zh_grupo) y está marcado como válido
export const conceptRecordExistsByIdGroup = async (groupId) => {
    try {
        const { results } = await dbConnection.query(`
            SELECT 
                id AS id2, 
                CAST(zh_id AS CHAR) AS id, 
                nombre AS nombre
            FROM 
                concepto 
            WHERE 
                zh_grupo = ? 
                AND valido = 1
        `, [groupId]);

        return results;

    } catch (error) {
        console.error('Error en la consulta de: conceptRecordExistsByIdGroup', error);
        throw error;
    }
};

// Función para verificar si existe un concepto en la tabla concepto por 
