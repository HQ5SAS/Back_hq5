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
