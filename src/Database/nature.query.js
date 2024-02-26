import { dbConnection } from './connection.js';

// Función para verificar si existe un registro en la tabla naturaleza_centro_costo por id cliente
export const natureRecordExistsByIdCustomer = async (customerId) => {
    try {
        const { results } = await dbConnection.query('SELECT id AS id2, CAST(zh_id AS CHAR) AS id, nombre FROM naturaleza_centro_costo WHERE zh_cliente = ?', [customerId]);

        if (results) {
            return results;
        } else {
            throw new Error('Error en la consulta de: natureRecordExistsByIdCustomer');
        }
    } catch (error) {
        console.error('Error en la consulta de: natureRecordExistsByIdCustomer', error);
        throw error;
    }
};
