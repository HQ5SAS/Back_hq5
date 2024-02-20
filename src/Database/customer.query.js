import { dbConnection } from '../Database/connection.js';

// OK

// Función para verificar si existe un registro en la tabla cliente
export const customerRecordExistsById = async (customerId) => {
    try {
        const { results } = await dbConnection.query('SELECT id, CAST(zh_id AS CHAR) AS zh_id, cliente FROM cliente WHERE zh_id = ? LIMIT 1', [customerId]);

        if (results.length === 0) {
            return { exists: false, id: null, customer: null };
        } else {
            const recordId = results[0].zh_id;
            const recordCustomer = results[0].cliente;
            return { exists: true, id: recordId, customer: recordCustomer };
        }
    } catch (error) {
        console.error('Error en la consulta de: customerRecordExistsById', error);
        throw error;
    }
};
