import { dbConnection } from './connection.js';

// OK

// Función para verificar si existe un registro en la tabla centro_costo por id cliente
export const costCenterRecordExistsByIdCustomerIdCity = async (customerId, cityId) => {
    try {
        const { results } = await dbConnection.query('SELECT id AS id2, CAST(zh_id AS CHAR) AS id, nombre AS nombre, dias_pago AS dias_pago, periodicidad_pago AS periodicidad FROM centro_costo WHERE zh_cliente = ?', [customerId]);
        return results;
    } catch (error) {
        console.error('Error en la consulta de: costCenterRecordExistsByIdCustomerIdCity', error);
        throw error;
    }
};
