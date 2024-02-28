import { dbConnection } from './connection.js';

// Función para verificar si existe un registro en la tabla linea_negocio por customerId (zh_cliente)
export const businessLineRecordExistsByIdCustomer = async (customerId) => {
    try {
        const { results } = await dbConnection.query(`
            SELECT 
                id AS id2, 
                CAST(zh_id AS CHAR) AS id, 
                nombre AS nombre
            FROM 
                linea_negocio 
            WHERE 
                zh_cliente = ?
        `, [customerId]);

        return results;

    } catch (error) {
        console.error('Error en la consulta de: businessLineRecordExistsByIdCustomer', error);
        throw error;
    }
};