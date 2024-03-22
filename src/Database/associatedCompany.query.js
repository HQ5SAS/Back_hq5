import { dbConnection } from './connection.js';

// Función para verificar si existe un registro en la tabla empresa_asociada por customerId (zh_cliente)
export const associatedCompanyRecordExistsByIdCustomer = async (customerId) => {
    try {
        const { results } = await dbConnection.query(`
            SELECT 
                id AS id2, 
                CAST(zh_id AS CHAR) AS id, 
                empresa_asociada AS empresa,
                clase_nom AS clase
            FROM 
                empresa_asociada
            WHERE 
                zh_cliente = ?
        `, [customerId]);

        return results;

    } catch (error) {
        console.error('Error en la consulta de: associatedCompanyRecordExistsByIdCustomer', error);
        throw error;
    }
};