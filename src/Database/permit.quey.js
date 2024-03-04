import { dbConnection } from './connection.js';

// Función que realiza la consulta de los permisos del contacto por contactId (permiso_bot.zh_contacto)
export const permitRecordExistsByContact = async (contactId) => {
    try {
        const { results } = await dbConnection.query(`
            SELECT 
                permiso_bot.id AS id,
                CAST(permiso_bot.zh_id AS CHAR) AS zh_id,
                permiso_bot.estado AS estado,
                CAST(permiso_bot.zh_contacto AS CHAR) AS zh_contacto,
                proceso_ov.nombre AS nombre_proceso,
                tarea_bot.id AS tarea_bot_id2,
                CAST(tarea_bot.zh_id AS CHAR) AS tarea_bot_id,
                tarea_bot.nombre AS nombre_tarea_bot
            FROM 
                permiso_bot
            JOIN 
                proceso_ov ON permiso_bot.zh_proceso_ov = proceso_ov.zh_id
            JOIN 
                tarea_bot ON permiso_bot.zh_tarea_bot = tarea_bot.zh_id
            WHERE 
                permiso_bot.zh_contacto = ?;
        `, [contactId]);

        return results;

    } catch (error) {
        console.error('Error en la consulta de: permitRecordExistsByContact', error);
        throw error;
    }
};

// Función que realiza la consulta de los permisos del contacto por cel y customer (contacto.celular, contacto.zh_cliente)
export const permitRecordExistsByClient = async (cel, customerId) => {
    try {
        const { results } = await dbConnection.query(`
            SELECT 
                permiso_bot.id AS id,
                CAST(permiso_bot.zh_id AS CHAR) AS zh_id,
                permiso_bot.estado AS estado,
                CAST(permiso_bot.zh_contacto AS CHAR) AS zh_contacto,
                proceso_ov.nombre AS nombre_proceso,
                tarea_bot.id AS tarea_bot_id2,
                CAST(tarea_bot.zh_id AS CHAR) AS tarea_bot_id,
                tarea_bot.nombre AS nombre_tarea_bot
            FROM 
                permiso_bot
            JOIN 
                proceso_ov ON permiso_bot.zh_proceso_ov = proceso_ov.zh_id
            JOIN 
                tarea_bot ON permiso_bot.zh_tarea_bot = tarea_bot.zh_id
            JOIN 
                contacto ON permiso_bot.zh_contacto = contacto.zh_id
            WHERE 
                contacto.celular = ? AND contacto.zh_cliente = ?;
        `, [cel, customerId]);

        return results;

    } catch (error) {
        console.error('Error en la consulta de: permitRecordExistsByClient', error);
        throw error;
    }
};
