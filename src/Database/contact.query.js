import { dbConnection } from './connection.js';
import { CLI_STATE_ACT } from './fields.js'

// Función que realiza la consulta del contacto
export const contactRecordExistsByCel = (cel) => {
    return new Promise((resolve, reject) => {
        const sqlQuery = `
            SELECT 
                contacto.id AS id2,
                CONVERT(contacto.zh_id, CHAR) AS id,
                contacto.nombre AS nombre,
                contacto.celular AS celular,
                contacto.estado AS estado,
                cliente.id AS id_cliente2,
                CONVERT(cliente.zh_id, CHAR) AS id_cliente,
                cliente.cliente AS cliente
            FROM contacto
            JOIN cliente ON contacto.zh_cliente = cliente.zh_id
            WHERE contacto.celular = ? AND cliente.estado = '${CLI_STATE_ACT}';
        `;

        dbConnection.query(sqlQuery, [cel], (results, fields) => {
            if (results) {
                resolve(results);
            } else {
                reject('Error en la consulta de: contactRecordExistsByCel');
            }
        });
    });
};

// Función para actualizar en la tabla contacto el campo de fk_wz_id de acuerdo al cliente que interactua con el bot
export const updateContactWzIdById = (contactId, wzId) => {
    return new Promise((resolve, reject) => {
        const sqlQuery = `
            UPDATE contacto
            SET fk_wz_id = ?
            WHERE zh_id = ?;
        `;

        dbConnection.query(sqlQuery, [wzId, contactId], (results, fields) => {
            if (results.affectedRows > 0) {
                resolve(results);
            } else {
                reject('Error en la actualización de contacto');
            }
        });
    });
};
