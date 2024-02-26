import { dbConnection } from './connection.js';

// Función para verificar si existe un registro en la tabla area por id cliente
export const areaRecordExistsByIdCustomer = async (customerId) => {
    try {
        const { results } = await dbConnection.query('SELECT id AS id2, CAST(zh_id AS CHAR) AS id, nombre FROM area WHERE zh_cliente = ?', [customerId]);
        return results;
    } catch (error) {
        console.error('Error en la consulta de: areaRecordExistsByIdCustomer', error);
        throw error;
    }
};
