import { dbConnection } from './connection.js';

// Función que realiza la consulta de los permisos del contacto
export const permitRecordExistsByContact = async (contactId) => {
    try {
        const { results } = await dbConnection.query(`
            SELECT 
                permiso.id AS id,
                CAST(permiso.zh_id AS CHAR) AS zh_id,
                permiso.estado AS estado,
                CAST(permiso.zh_contacto AS CHAR) AS zh_contacto,
                proceso_ov.nombre AS nombre_proceso,
                tarea_bot.id AS tarea_bot_id2,
                CAST(tarea_bot.zh_id AS CHAR) AS tarea_bot_id,
                tarea_bot.nombre AS nombre_tarea_bot
            FROM permiso
            JOIN proceso_ov ON permiso.zh_proceso = proceso_ov.zh_id
            JOIN tarea_bot ON tarea_bot.zh_proceso = proceso_ov.zh_id
            WHERE permiso.zh_contacto = ?;
        `, [contactId]);

        return results;
    } catch (error) {
        console.error('Error en la consulta de: permitRecordExistsByContact', error);
        throw error;
    }
};

// Función que realiza la consulta de los permisos del contacto por cliente
export const permitRecordExistsByClient = async (cel, customer) => {
    try {
        const { results } = await dbConnection.query(`
            SELECT 
                permiso.id AS id,
                CAST(permiso.zh_id AS CHAR) AS zh_id,
                permiso.estado AS estado,
                CAST(permiso.zh_contacto AS CHAR) AS zh_contacto,
                proceso_ov.nombre AS nombre_proceso,
                tarea_bot.id AS tarea_bot_id2,
                CAST(tarea_bot.zh_id AS CHAR) AS tarea_bot_id,
                tarea_bot.nombre AS nombre_tarea_bot                
            FROM permiso
            JOIN proceso_ov ON permiso.zh_proceso = proceso_ov.zh_id
            JOIN tarea_bot ON tarea_bot.zh_proceso = proceso_ov.zh_id
            JOIN contacto ON contacto.zh_id = permiso.zh_contacto
            WHERE contacto.celular = ? AND contacto.zh_cliente = ?;
        `, [cel, customer]);

        return results;
    } catch (error) {
        console.error('Error en la consulta de: permitRecordExistsByClient', error);
        throw error;
    }
};
