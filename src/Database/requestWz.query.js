import { dbConnection } from './connection.js';

// Función para realizar la inserción de registros en la tabla solicitud_wz por (fk_wz_id, zh_cliente, zh_tarea_bot)
export const requestWzRecordInsert = async (wzId, customerId, taskId) => {
    try {
        const result = await dbConnection.query(`
            INSERT INTO 
                solicitud_wz (fk_wz_id, zh_cliente, zh_tarea_bot) 
            VALUES 
                (?, ?, ?)
        `, [wzId, customerId, taskId]);

        const insertId = result.results.insertId;

        if (result && insertId !== undefined) {
            console.log(`Se insertó en la tabla solicitud wz con ID: ${insertId}`);
            return { id: insertId };
            
        } else {
            console.error('Error al insertar en la tabla solicitud wz: requestWzRecordInsert');
            throw new Error('Error al insertar un registro en la tabla solicitud wz');
        }

    } catch (error) {
        console.error('Error en la consulta de: requestWzRecordInsert', error);
        throw error;
    }
};

// Función para verificar si existe un registro en la tabla solicitud_wz por id (id)
export const requestWzRecordExistsById = async (id) => {
    try {
        const { results } = await dbConnection.query(`
            SELECT 
                solicitud_wz.id AS id,
                CONVERT(solicitud_wz.fk_wz_id, CHAR) AS wz_id, 
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
            LIMIT 
                1
        `, [id]);

        const [record] = results;
        return {
            exists: record !== undefined,
            id: record?.id || null,
            cliente_id: record?.cliente_id || null,
            tarea_id: record?.tarea_id || null,
            cliente_nombre: record?.cliente_nombre || null,
            tarea_nombre: record?.tarea_nombre || null,
            wz_id: record?.wz_id || null
        };

    } catch (error) {
        console.error('Error en la consulta de: requestWzRecordExistsById', error);
        throw error;
    }
};