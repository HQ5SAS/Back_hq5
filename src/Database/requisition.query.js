import { dbConnection } from './connection.js';

// Función para verificar si existe un registro en la tabla requisicion por customerId (zh_cliente)
export const requisitionRecordExistsByIdCustomer = async (customerId) => {
    try {
        const sql = `
            SELECT
                requisicion.id AS id2,
                CAST(requisicion.zh_id AS CHAR) AS id,
                CAST(requisicion.zh_cliente AS CHAR) AS id_cliente,
                requisicion.salario_base AS salario,
                requisicion.estado AS estado_req,
                CAST(requisicion.zh_tipo_jornada AS CHAR) AS tipo_jornada,
                CAST(requisicion.zh_tipo_contrato AS CHAR) AS tipo_contrato,
                CAST(requisicion.zh_ciudad AS CHAR) AS id_ciudad,
                CAST(perfil.zh_id AS CHAR) AS id_profile,
                perfil.nombre AS nombre
            FROM
                requisicion
            JOIN
                perfil ON requisicion.zh_perfil = perfil.zh_id
            WHERE
                requisicion.zh_cliente = ? 
                AND requisicion.estado = 'ACEPTADA'
            ORDER BY 
                requisicion.creacion DESC;
        `;

        const params = [customerId];
        const { results } = await dbConnection.query(sql, params);

        if (results) {
            return results;
        } else {
            throw new Error('Error en la consulta de: requisitionRecordExistsByIdCustomer');
        }

    } catch (error) {
        console.error('Error en la consulta de: requisitionRecordExistsByIdCustomer', error);
        throw error;
    }
};

// Función para verificar si existe un registro en la tabla requisicion por requisitionId (zh_id)
export const requisitionRecordExistsById = async (requisitionId) => {
    try {
        const sql = `
            SELECT
                requisicion.id AS id2,
                CAST(requisicion.zh_id AS CHAR) AS id,
                CAST(requisicion.zh_cliente AS CHAR) AS id_cliente,
                requisicion.salario_base AS salario,
                requisicion.estado AS estado_req,
                CAST(requisicion.zh_tipo_jornada AS CHAR) AS tipo_jornada,
                CAST(requisicion.zh_tipo_contrato AS CHAR) AS tipo_contrato,
                CAST(requisicion.zh_ciudad AS CHAR) AS id_ciudad,
                CAST(perfil.zh_id AS CHAR) AS id_profile,
                perfil.nombre AS nombre
            FROM
                requisicion
            JOIN
                perfil ON requisicion.zh_perfil = perfil.zh_id
            WHERE
                requisicion.zh_id = ? 
            LIMIT
                1
        `;

        const params = [requisitionId];
        const { results } = await dbConnection.query(sql, params);

        if (results) {
            return results;
        } else {
            throw new Error('Error en la consulta de: requisitionRecordExistsById');
        }
        
    } catch (error) {
        console.error('Error en la consulta de: requisitionRecordExistsById', error);
        throw error;
    }
};