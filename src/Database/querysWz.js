import { dbConnection } from './connection.js';

// Función para realizar la inserción de registros en la tabla wz (Woztell)
export const wzRecordInsert = (id, externalId, app) => {
    return new Promise(async (resolve, reject) => {
        const sqlQuery = `
            INSERT IGNORE INTO 
                wz (wz_miembro_id, wz_externo_id, wz_app) 
            VALUES 
                (?, ?, ?)
        `;

        dbConnection.query(sqlQuery, [id, externalId, app, ], (result, error) => {
            if (result && result.insertId !== undefined) {
                console.log(`Se insertó en la tabla wz con ID: ${result.insertId}`);
                resolve({ id: result.insertId});
            } else {
                console.error('Error al insertar en la tabla wz: InsertId no válido');
                reject('Error al insertar un registro en la tabla wz');
            }
        });
    });
};

// Función para verificar si existe un registro en la tabla wz por member_id (woztell)
export const wzRecordExistsByMemberId = (wz_miembro_id) => {
    return new Promise((resolve, reject) => {
        const sqlQuery = 'SELECT id, wz_externo_id FROM wz WHERE wz_miembro_id = ? LIMIT 1';
  
        dbConnection.query(sqlQuery, [wz_miembro_id], (results, fields) => {
            if (results.length === 0) {
                resolve({ exists: false, id: null, externalId: null });
            } else {
                const recordId = results[0].id;
                const recordExternalId = results[0].wz_externo_id;
                resolve({ exists: true, id: recordId, externalId: recordExternalId});
            }
        });
    });
};

// Función para verificar si existe un registro en la tabla wz por id (woztell)
export const wzRecordExistsById = (id) => {
    return new Promise((resolve, reject) => {
        const sqlQuery = 'SELECT id, wz_externo_id FROM wz WHERE id = ? LIMIT 1';
  
        dbConnection.query(sqlQuery, [id], (results, fields) => {
            if (results.length === 0) {
                resolve({ exists: false, id: null, externalId: null });
            } else {
                const recordId = results[0].id;
                const recordExternalId = results[0].wz_externo_id;
                resolve({ exists: true, id: recordId, externalId: recordExternalId});
            }
        });
    });
};