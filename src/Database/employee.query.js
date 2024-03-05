import { dbConnection } from './connection.js';

// Función para consultar el gestor de operaciones por employeeId (zh_id) en la tabla empleado
export const employeeRecordExistsById = async (employeeId) => {
    try {
        const sql = `
            SELECT
                empleado.id AS id2,
                CAST(empleado.zh_id AS CHAR) AS id,
                CAST(empleado.numero_contrato AS CHAR) AS celular_corp,
                hv.primer_nombre AS nombre,
                hv.primer_apellido AS apellido
            FROM
                empleado
            JOIN
                hv ON empleado.zh_hv = hv.zh_id
            WHERE
                empleado.zh_id = ? 
            LIMIT
                1
        `;

        const params = [ employeeId ];
        const { results } = await dbConnection.query(sql, params);

        if (results) {
            return results.length > 0 ? results[0] : null;
        } else {
            throw new Error('Error en la consulta de: employeeRecordExistsById');
        }

    } catch (error) {
        console.error('Error en la consulta de: employeeRecordExistsById', error);
        throw error;
    }
};

// Función para consultar los empleados por customerId (zh_cliente) y workerState (estado_trabajador) en la tabla empleado
export const employeeRecordExistsByCustomerAndState = async (customerId, workerState) => {
    try {
        const sql = `
            SELECT
                empleado.id AS id2,
                CAST(empleado.zh_id AS CHAR) AS id,
                hv.num_documento AS documento,
                hv.primer_nombre AS nombre,
                hv.primer_apellido AS apellido,
                empleado.fecha_ingreso AS fecha_ingreso
            FROM
                empleado
            JOIN
                hv ON empleado.zh_hv = hv.zh_id
            WHERE
                empleado.zh_cliente = ? 
                AND empleado.estado_trabajador = ?
        `;

        const params = [ customerId, workerState ];
        const { results } = await dbConnection.query(sql, params);

        if (results) {
            return results;
        } else {
            throw new Error('Error en la consulta de: employeeRecordExistsByCustomerAndState');
        }

    } catch (error) {
        console.error('Error en la consulta de: employeeRecordExistsByCustomerAndState', error);
        throw error;
    }
};