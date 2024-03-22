import { dbConnection } from './connection.js';

// Función para verificar si existe un registro en la tabla jefe_inmediato por customerId (zh_cliente)
export const immediateBossRecordExistsByIdCustomer = async (customerId) => {
    try {
        const { results } = await dbConnection.query(`
            SELECT 
                id AS id2, 
                CAST(zh_id AS CHAR) AS id, 
                nombre AS nombre,
                documento AS documento
            FROM 
                jefe_inmediato
            WHERE 
                zh_cliente = ?
        `, [customerId]);

        return results;

    } catch (error) {
        console.error('Error en la consulta de: immediateBossRecordExistsByIdCustomer', error);
        throw error;
    }
};