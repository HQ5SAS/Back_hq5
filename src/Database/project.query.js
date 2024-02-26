import { dbConnection } from './connection.js';

// Función para verificar si existe un registro en la tabla proyecto por id cliente
export const projectRecordExistsByIdCustomer = async (customerId) => {
    try {
        const { results } = await dbConnection.query('SELECT id AS id2, CAST(zh_id AS CHAR) AS id, nombre FROM proyecto WHERE zh_cliente = ?', [customerId]);

        if (results) {
            return results;
        } else {
            throw new Error('Error en la consulta de: projectRecordExistsByIdCustomer');
        }
    } catch (error) {
        console.error('Error en la consulta de: projectRecordExistsByIdCustomer', error);
        throw error;
    }
};
