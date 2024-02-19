import { dbConnection } from './connection.js';

// Función para realizar la inserción de registros en la tabla solicitud_wz
export const requestWzRecordInsert = (wzId, customerId, taskId) => {
    return new Promise(async (resolve, reject) => {
        const sqlQuery = `
            INSERT INTO solicitud_wz (fk_wz_id, zh_cliente, zh_tarea_bot) 
            VALUES (?, ?, ?)
        `;

        dbConnection.query(sqlQuery, [wzId, customerId, taskId], (result, error) => {
            if (result && result.insertId !== undefined) {
                console.log(`Se insertó en la tabla solicitud wz con ID: ${result.insertId}`);
                resolve({ id: result.insertId });
            } else {
                console.error('Error al insertar en la tabla solicitud wz: requestWzRecordInsert');
                reject('Error al insertar un registro en la tabla solicitud wz');
            }
        });
    });
};

// Función para verificar la existencia del registro en las últimas 24 horas tabala solicitud_wz
export const requestWzRecordExists = (wzId, customerId, taskId) => {
    return new Promise(async (resolve, reject) => {
        const sqlQuery = `
            SELECT id
            FROM solicitud_wz 
            WHERE fk_wz_id = ? AND zh_cliente = ? AND zh_tarea_bot = ? 
                  AND creacion >= NOW() - INTERVAL 1 DAY
        `;

        dbConnection.query(sqlQuery, [wzId, customerId, taskId], (result, error) => {
            if (result && result.length > 0) {
                resolve({ exists: true, id: result[0].id });
            } else {
                resolve({ exists: false, id :null});
            }
        });
    });
};

// Función para verificar si existe un registro en la tabla solicitud_wz
export const requestWzRecordExistsById = (id) => {
    return new Promise((resolve, reject) => {
        const sqlQuery = `
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
        `;
  
        dbConnection.query(sqlQuery, [id], (results, fields) => {
            if (results.length === 0) {
                resolve({ 
                    exists: false, 
                    id: null, 
                    cliente_id: null, 
                    tarea_id: null,
                    cliente_nombre: null,
                    tarea_nombre: null
                });
            } else {
                const { id, cliente_id, tarea_id, cliente_nombre, tarea_nombre } = results[0];
                resolve({
                    exists: true,
                    id: id,
                    cliente_id: cliente_id,
                    tarea_id: tarea_id,
                    cliente_nombre: cliente_nombre,
                    tarea_nombre: tarea_nombre,
                });
            }
        });
    });
};