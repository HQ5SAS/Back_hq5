import { dbConnection } from './connection.js';

// Función para realizar la inserción de registros en la tabla solicitud_wz
export const requestWzRecordInsert = async (wzId, customerId, taskId) => {
    try {
        const result = await dbConnection.query('INSERT INTO solicitud_wz (fk_wz_id, zh_cliente, zh_tarea_bot) VALUES (?, ?, ?)', [wzId, customerId, taskId]);

        if (result && result.results.insertId !== undefined) {
            console.log(`Se insertó en la tabla solicitud wz con ID: ${result.results.insertId}`);
            return { id: result.results.insertId };
        } else {
            console.error('Error al insertar en la tabla solicitud wz: requestWzRecordInsert');
            throw new Error('Error al insertar un registro en la tabla solicitud wz');
        }
    } catch (error) {
        console.error('Error en la consulta de: requestWzRecordInsert', error);
        throw error;
    }
};

// Función para verificar la existencia del registro en las últimas 24 horas tabla solicitud_wz
export const requestWzRecordExists = async (wzId, customerId, taskId) => {
    try {
        const { results } = await dbConnection.query(`
                SELECT 
                    id 
                FROM 
                    solicitud_wz 
                WHERE 
                    fk_wz_id = ? 
                    AND zh_cliente = ? 
                    AND zh_tarea_bot = ? 
                    AND creacion >= NOW() - INTERVAL 1 MINUTE;
                `, [wzId, customerId, taskId]);

        if (results && results.length > 0) {
            return { exists: true, id: results[0].id };
        } else {
            return { exists: false, id: null };
        }
    } catch (error) {
        console.error('Error en la consulta de: requestWzRecordExists', error);
        throw error;
    }
};

// Función para verificar si existe un registro en la tabla solicitud_wz
export const requestWzRecordExistsById = async (id) => {
    try {
        const { results } = await dbConnection.query(`
            SELECT 
                solicitud_wz.id AS id,
                CONVERT(solicitud_wz.zh_cliente, CHAR) AS cliente_id, 
                CONVERT(solicitud_wz.zh_tarea_bot, CHAR) AS tarea_id,
                cliente.cliente AS cliente_nombre, 
                tarea_bot.nombre AS tarea_nombre
            FROM 
                solicitud_wz
            LEFT JOIN 
                cliente ON solicitud_wz.zh_cliente = cliente.zh_id
            LEFT JOIN 
                tarea_bot ON solicitud_wz.zh_tarea_bot = tarea_bot.zh_id
            WHERE 
                solicitud_wz.id = ? 
            LIMIT 1
        `, [id]);

        if (results.length === 0) {
            return { 
                exists: false, 
                id: null, 
                cliente_id: null, 
                tarea_id: null,
                cliente_nombre: null,
                tarea_nombre: null
            };
        } else {
            const { id, cliente_id, tarea_id, cliente_nombre, tarea_nombre } = results[0];
            return {
                exists: true,
                id: id,
                cliente_id: cliente_id,
                tarea_id: tarea_id,
                cliente_nombre: cliente_nombre,
                tarea_nombre: tarea_nombre,
            };
        }
    } catch (error) {
        console.error('Error en la consulta de: requestWzRecordExistsById', error);
        throw error;
    }
};
