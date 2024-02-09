import { dbConnection } from '../Database/connection.js';

// Función para realizar la inserción de registros en la tabla solicitud_wz
export const requestWzRecordInsert = (wz_id, customer_id, task_id) => {
    return new Promise(async (resolve, reject) => {
        const sqlQuery = `
            INSERT INTO solicitud_wz (fk_wz_id, fk_cliente_id, fk_tarea_bot_id) 
            VALUES (?, ?, ?)
        `;

        dbConnection.query(sqlQuery, [wz_id, customer_id, task_id], (result, error) => {
            if (result && result.insertId !== undefined) {
                console.log(`Se insertó en la tabla solicitud wz con ID: ${result.insertId}`);
                resolve({ id: result.insertId });
            } else {
                console.error('Error al insertar en la tabla solicitud wz');
                reject('Error al insertar un registro en la tabla solicitud wz');
            }
        });
    });
};

// Función para verificar la existencia del registro en las últimas 24 horas tabala solicitud_wz
export const requestWzRecordExists = (wz_id, customer_id, task_id) => {
    return new Promise(async (resolve, reject) => {
        const sqlQuery = `
            SELECT id
            FROM solicitud_wz 
            WHERE fk_wz_id = ? AND fk_cliente_id = ? AND fk_tarea_bot_id = ? 
                  AND creacion >= NOW() - INTERVAL 1 DAY
        `;

        dbConnection.query(sqlQuery, [wz_id, customer_id, task_id], (result, error) => {
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
            solicitud_wz.id, 
            solicitud_wz.fk_cliente_id, 
            solicitud_wz.fk_tarea_bot_id,
            cliente.cliente AS cliente_nombre, 
            tarea_bot.nombre AS tarea_nombre
        FROM 
            solicitud_wz
        LEFT JOIN 
            cliente ON solicitud_wz.fk_cliente_id = cliente.id
        LEFT JOIN 
            tarea_bot ON solicitud_wz.fk_tarea_bot_id = tarea_bot.id
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
                const recordId = results[0].id;
                const recordClienteId = results[0].fk_cliente_id;
                const recordTareaId = results[0].fk_tarea_bot_id;
                const recordClienteNombre = results[0].cliente_nombre;
                const recordTareaNombre = results[0].tarea_nombre;
                resolve({
                    exists: true,
                    id: recordId,
                    cliente_id: recordClienteId,
                    tarea_id: recordTareaId,
                    cliente_nombre: recordClienteNombre,
                    tarea_nombre: recordTareaNombre
                });
            }
        });
    });
};