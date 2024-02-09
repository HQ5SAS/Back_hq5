import { dbConnection } from './connection.js';

// Función que realiza la consulta de los permisos del contacto
export const permitRecordExistsByContact = (contact) => {
    return new Promise((resolve, reject) => {
        const sqlQuery = `
            SELECT 
                permiso.id,
                permiso.estado,
                permiso.fk_contacto_id,
                proceso.nombre AS nombre_proceso,
                tarea_bot.id AS tarea_bot_id,
                tarea_bot.nombre AS nombre_tarea_bot
            FROM permiso
            JOIN proceso ON permiso.fk_proceso_id = proceso.id
            JOIN tarea_bot ON tarea_bot.fk_proceso_id = proceso.id
            WHERE permiso.fk_contacto_id = ?;
        `;
        dbConnection.query(sqlQuery, [contact], (results, fields) => {
            if (results) {
                resolve(results);
            } else {
                reject('Error en la consulta de permisos');
            }
        });
    });
};

// Función que realiza la consulta de los permisos del contacto por cliente
export const permitRecordExistsByClient = (cel, customer) => {
    return new Promise((resolve, reject) => {
        const sqlQuery = `
            SELECT 
                permiso.id,
                permiso.estado,
                permiso.fk_contacto_id,
                proceso.nombre AS nombre_proceso,
                tarea_bot.id AS tarea_bot_id,
                tarea_bot.nombre AS nombre_tarea_bot
            FROM permiso
            JOIN proceso ON permiso.fk_proceso_id = proceso.id
            JOIN tarea_bot ON tarea_bot.fk_proceso_id = proceso.id
            JOIN contacto ON contacto.id = permiso.fk_contacto_id
            WHERE contacto.celular = ? AND contacto.fk_cliente_id = ?;
        `;
        dbConnection.query(sqlQuery, [cel, customer], (results, fields) => {
            if (results) {
                resolve(results);
            } else {
                reject('Error en la consulta de permisos asociados a un cliente');
            }
        });
    });
};