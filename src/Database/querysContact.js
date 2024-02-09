import { dbConnection } from '../Database/connection.js';
import { CLI_STATE_ACT } from './fields.js'

// Función que realiza la consulta del contacto
export const contactRecordExistsByCel = (cel) => {
    return new Promise((resolve, reject) => {
        const sqlQuery = `
            SELECT 
                contacto.id,
                contacto.nombre,
                contacto.celular,
                contacto.estado,
                cliente.cliente,
                cliente.id AS id_cliente
            FROM contacto
            JOIN cliente ON contacto.fk_cliente_id = cliente.id
            WHERE contacto.celular = ? AND cliente.estado = '${CLI_STATE_ACT}';
        `;

        dbConnection.query(sqlQuery, [cel], (results, fields) => {
            if (results) {
                resolve(results);
            } else {
                reject('Error en la consulta del usuario');
            }
        });
    });
};
