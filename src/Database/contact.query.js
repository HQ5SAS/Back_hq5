import { dbConnection } from './connection.js';
import { CLI_STATE_ACT } from './fields.js';

// Función que realiza la consulta del contacto por cel (contacto.celular)
export const contactRecordExistsByCel = async (cel) => {
    try {
        const { results } = await dbConnection.query(`
            SELECT 
                contacto.id AS id2,
                CAST(contacto.zh_id AS CHAR) AS id,
                contacto.nombre AS nombre,
                contacto.celular AS celular,
                contacto.estado AS estado,
                cliente.id AS id_cliente2,
                CAST(cliente.zh_id AS CHAR) AS id_cliente,
                cliente.cliente AS cliente
            FROM 
                contacto
            JOIN 
                cliente ON contacto.zh_cliente = cliente.zh_id
            WHERE 
                contacto.celular = ? 
                AND cliente.estado = ?;
        `, [cel, CLI_STATE_ACT]);

        return results;
        
    } catch (error) {
        console.error('Error en la consulta de: contactRecordExistsByCel', error);
        throw error;
    }
};

// Función para actualizar en la tabla contacto el campo de fk_wz_id de acuerdo al cliente que interactúa con el bot
export const updateContactWzIdById = async (contactId, wzId) => {
    try {
        const { results } = await dbConnection.query(`
            UPDATE contacto
            SET fk_wz_id = ?
            WHERE zh_id = ?;
        `, [wzId, contactId]);

        if (results.affectedRows > 0) {
            return results;

        } else {
            throw new Error('Error en la actualización de contacto: updateContactWzIdById');
        }

    } catch (error) {
        console.error('Error en la actualización de contacto: updateContactWzIdById', error);
        throw error;
    }
};

// Función que realiza la consulta de contacto por Id (zh_id)
export const contactRecordExistsById = async (Id) => {
    try {
        const { results } = await dbConnection.query(`
            SELECT 
                id AS id2,
                CAST(zh_id AS CHAR) AS id,
                nombre AS nombre,
                celular AS celular,
                estado AS estado
            FROM 
                contacto
            WHERE 
                zh_id = ?
            LIMIT 
                1;
        `, [Id, CLI_STATE_ACT]);

        return results;

    } catch (error) {
        console.error('Error en la consulta de: contactRecordExistsById', error);
        throw error;
    }
};