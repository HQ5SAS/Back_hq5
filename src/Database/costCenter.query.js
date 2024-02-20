import { dbConnection } from './connection.js';

// OK

// Función para verificar si existe un registro en la tabla centro_costo por id cliente
export const costCenterRecordExistsByIdCustomer = async (customerId) => {
    try {
        const { results } = await dbConnection.query('SELECT id AS id2, CAST(zh_id AS CHAR) AS id, nombre FROM centro_costo WHERE zh_cliente = ?', [customerId]);
        return results;
    } catch (error) {
        console.error('Error en la consulta de: costCenterRecordExistsByIdCustomer', error);
        throw error;
    }
};
