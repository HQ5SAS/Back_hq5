import { dbConnection } from './connection.js';

// Función para verificar si existe un registro en la tabla centro_costo por customerId, cityId (zh_cliente, zh_ciudad)
export const costCenterRecordExistsByIdCustomerIdCity = async (customerId, cityId) => {
    try {
        const { results } = await dbConnection.query(`
            SELECT 
                id AS id2, 
                CAST(zh_id AS CHAR) AS id, 
                nombre AS nombre, 
                dias_pago AS dias_pago, 
                periodicidad_pago AS periodicidad 
            FROM 
                centro_costo 
            WHERE 
                zh_cliente = ? 
                AND estado = '1' 
                AND zh_ciudad = ?;
        `, [customerId, cityId]);

        return results;

    } catch (error) {
        console.error('Error en la consulta de: costCenterRecordExistsByIdCustomerIdCity', error);
        throw error;
    }
};

// Funcion para verificar si existe un registro en la tabla centro_costo por customerId (zh_cliente)
export const costCenterRecordExistsByIdCustomer = async (customerId) => {
    try {
        const { results } = await dbConnection.query(`
            SELECT 
                id AS id2, 
                CAST(zh_id AS CHAR) AS id, 
                nombre AS nombre, 
                dias_pago AS dias_pago, 
                periodicidad_pago AS periodicidad
            FROM 
                centro_costo 
            WHERE 
                zh_cliente = ? 
                AND estado = '1';
        `, [customerId]);

        return results;

    } catch (error) {
        console.error('Error en la consulta de: costCenterRecordExistsByIdCustomer', error);
        throw error;
    }
};
