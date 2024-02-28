import { dbConnection } from './connection.js';

// Función para insertar registros en la tabla wz (Woztell)
export const wzRecordInsert = async (memberId, externalId, app) => {
    try {
        const result = await dbConnection.query(`
            INSERT IGNORE INTO 
                wz (wz_miembro_id, wz_externo_id, wz_app) 
            VALUES 
                (?, ?, ?)
        `, [memberId, externalId, app]);

        const insertId = result.results.insertId;

        if (result && insertId !== undefined) {
            console.log(`Se insertó en la tabla wz con ID: ${insertId}`);
            return { id: insertId };
        
        } else {
            console.error('Error al insertar un registro en la tabla wz: wzRecordInsert');
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
        const { results }  = await dbConnection.query(`
            SELECT 
                id, 
                wz_miembro_id, 
                wz_externo_id 
            FROM 
                wz 
            WHERE 
                wz_miembro_id = ? 
            LIMIT 
                1
        `, [memberId]);

        const [ firstResult ] = results;
        const { id: recordId, wz_miembro_id: recordMemberId, wz_externo_id: recordExternalId } = firstResult || {};

        return {
            exists: results.length > 0,
            id: recordId || null,
            memberId: recordMemberId || null,
            externalId: recordExternalId || null,
        };

    } catch (error) {
        console.error('Error en la consulta de: wzRecordExistsByMemberId', error);
        throw error;
    }
};

// Función para verificar si existe un registro en la tabla wz por id (woztell)
export const wzRecordExistsById = async (id) => {
    try {
        const { results } = await dbConnection.query(`
            SELECT
                id,
                wz_miembro_id,
                wz_externo_id
            FROM
                wz
            WHERE
                id = ?
            LIMIT
                1
        `, [id]);

        const [ firstResult ] = results;
        const { id: recordId, wz_miembro_id: recordMemberId, wz_externo_id: recordExternalId } = firstResult || {};

        return {
            exists: results.length > 0,
            id: recordId || null,
            memberId: recordMemberId || null,
            externalId: recordExternalId || null
        };

    } catch (error) {
        console.error('Error en la consulta de: wzRecordExistsById', error);
        throw error;
    }
};