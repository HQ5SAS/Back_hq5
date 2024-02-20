import { dbConnection } from './connection.js';

// OK

// Función para verificar si existe un registro en la tabla subcentro_costo por id cliente
export const subCostCenterRecordExistsByIdCustomer = async (customerId) => {
    try {
        const { results } = await dbConnection.query('SELECT id AS id2, CAST(zh_id AS CHAR) AS id, nombre FROM subcentro_costo WHERE zh_cliente = ?', [customerId]);

        if (results) {
            return results;
        } else {
            throw new Error('Error en la consulta de: subCostCenterRecordExistsByIdCustomer');
        }
    } catch (error) {
        console.error('Error en la consulta de: subCostCenterRecordExistsByIdCustomer', error);
        throw error;
    }
};
