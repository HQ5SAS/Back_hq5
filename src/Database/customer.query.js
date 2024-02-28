import { dbConnection } from '../Database/connection.js';

// Función para verificar si existe un registro en la tabla cliente por customerId (zh_id)
export const customerRecordExistsById = async (customerId) => {
    try {
        const { results } = await dbConnection.query(`
            SELECT 
                id AS id2, 
                CAST(zh_id AS CHAR) AS id, 
                cliente AS cliente
            FROM 
                cliente 
            WHERE 
                zh_id = ? 
            LIMIT 
                1
        `, [customerId]);

        const record = results?.[0];

        return {
            exists: results.length > 0,
            id: record?.id || null,
            customer: record?.cliente || null
        };

    } catch (error) {
        console.error('Error en la consulta de: customerRecordExistsById', error);
        throw error;
    }
};
