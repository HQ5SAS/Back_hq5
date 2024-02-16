import { dbConnection } from './connection.js';

// Función que realiza la consulta de los permisos del contacto
export const permitRecordExistsByContact = (contactId) => {
    return new Promise((resolve, reject) => {
        const sqlQuery = `
            SELECT 
                permiso.id AS id,
                permiso.zh_id AS zh_id,
                permiso.estado AS estado,
                permiso.zh_contacto AS zh_contacto,
                proceso_ov.nombre AS nombre_proceso,
                tarea_bot.id AS tarea_bot_id2,
                tarea_bot.zh_id AS tarea_bot_id,
                tarea_bot.nombre AS nombre_tarea_bot
            FROM permiso
            JOIN proceso_ov ON permiso.zh_proceso = proceso_ov.zh_id
            JOIN tarea_bot ON tarea_bot.zh_proceso = proceso_ov.zh_id
            WHERE permiso.zh_contacto = ?;
        `;
        dbConnection.query(sqlQuery, [contactId], (results, fields) => {
            if (results) {
                resolve(results);
            } else {
                reject('Error en la consulta de: permitRecordExistsByContact');
            }
        });
    });
};

// Función que realiza la consulta de los permisos del contacto por cliente
export const permitRecordExistsByClient = (cel, customer) => {
    return new Promise((resolve, reject) => {
        const sqlQuery = `
            SELECT 
                permiso.id AS id,
                permiso.zh_id AS zh_id,
                permiso.estado AS estado,
                permiso.zh_contacto AS zh_contacto,
                proceso_ov.nombre AS nombre_proceso,
                tarea_bot.id AS tarea_bot_id2,
                tarea_bot.zh_id AS tarea_bot_id,
                tarea_bot.nombre AS nombre_tarea_bot                
            FROM permiso
            JOIN proceso_ov ON permiso.zh_proceso = proceso_ov.zh_id
            JOIN tarea_bot ON tarea_bot.zh_proceso = proceso_ov.zh_id
            JOIN contacto ON contacto.zh_id = permiso.zh_contacto
            WHERE contacto.celular = ? AND contacto.zh_cliente = ?;
        `;
        dbConnection.query(sqlQuery, [cel, customer], (results, fields) => {
            if (results) {
                resolve(results);
            } else {
                reject('Error en la consulta de: permitRecordExistsByClient');
            }
        });
    });
};