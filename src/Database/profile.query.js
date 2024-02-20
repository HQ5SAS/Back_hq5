import { dbConnection } from './connection.js';

// OK

// Función para verificar si existe un registro en la tabla perfil por zh_id en perfil
export const profileRecordExistsById = async (Id) => {
    try {
        const { results } = await dbConnection.query('SELECT id AS id2, CAST(zh_id AS CHAR) AS id, nombre, nivel_riesgo FROM perfil WHERE zh_id = ?', [Id]);

        if (results) {
            return results;
        } else {
            throw new Error('Error en la consulta de: profileRecordExistsById');
        }
    } catch (error) {
        console.error('Error en la consulta de: profileRecordExistsById', error);
        throw error;
    }
};
