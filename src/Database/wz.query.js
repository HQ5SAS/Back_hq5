import { dbConnection } from './connection.js';

// Función para realizar la inserción de registros en la tabla wz (Woztell)
export const wzRecordInsert = async (memberId, externalId, app) => {
    try {
        const result = await dbConnection.query('INSERT IGNORE INTO wz (wz_miembro_id, wz_externo_id, wz_app) VALUES (?, ?, ?)', [memberId, externalId, app]);

        if (result && result.results.insertId !== undefined) {
            console.log(`Se insertó en la tabla wz con ID: ${result.results.insertId}`);
            return { id: result.results.insertId };
        } else {
            console.error('Error al insertar en la tabla wz: wzRecordInsert');
            throw new Error('Error al insertar un registro en la tabla wz');
        }
    } catch (error) {
        console.error('Error en la consulta de: wzRecordInsert', error);
        throw error;
    }
};

// Función para verificar si existe un registro en la tabla wz por wz_miembro_id (woztell)
export const wzRecordExistsByMemberId = async (memberId) => {
    try {
        const { results }  = await dbConnection.query('SELECT id, wz_miembro_id, wz_externo_id FROM wz WHERE wz_miembro_id = ? LIMIT 1', [memberId]);

        if (results.length === 0) {
            return { exists: false, id: null, memberId: null, externalId: null };
        } else {
            const recordId = results[0].id;
            const recordMemberId = results[0].wz_miembro_id;
            const recordExternalId = results[0].wz_externo_id;
            return { exists: true, id: recordId, memberId: recordMemberId, externalId: recordExternalId };
        }
    } catch (error) {
        console.error('Error en la consulta de: wzRecordExistsByMemberId', error);
        throw error;
    }
};

// Función para verificar si existe un registro en la tabla wz por id (woztell)
export const wzRecordExistsById = async (id) => {
    try {
        const { results } = await dbConnection.query('SELECT id, wz_miembro_id, wz_externo_id FROM wz WHERE id = ? LIMIT 1', [id]);

        if (results.length === 0) {
            return { exists: false, id: null, memberId: null, externalId: null };
        } else {
            const recordId = results[0].id;
            const recordMemberId = results[0].wz_miembro_id;
            const recordExternalId = results[0].wz_externo_id;
            return { exists: true, id: recordId, memberId: recordMemberId, externalId: recordExternalId };
        }
    } catch (error) {
        console.error('Error en la consulta de: wzRecordExistsById', error);
        throw error;
    }
};
