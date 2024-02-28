import { dbConnection } from './connection.js';

// Función para consultar registros en la tabla orden_ingreso por entryOrderMId (zh_ord_ingreso_masivo)
export const entryOrderRecordExistsByIdMas = async (entryOrderMId) => {
    try {
        const sql = `
            SELECT 
                id AS id2, 
                CAST(zh_id AS CHAR) AS id,
                CAST(zh_postulacion AS CHAR) AS id_postulado,
                CAST(zh_requisicion AS CHAR) AS id_requisicion,
                CAST(zh_ciudad AS CHAR) AS id_ciudad,
                CAST(zh_cliente AS CHAR) AS id_cliente
            FROM
                orden_ingreso 
            WHERE 
                zh_ord_ingreso_masivo = ?
        `;

        const params = [entryOrderMId];
        const { results } = await dbConnection.query(sql, params);
        return results;
        
    } catch (error) {
        console.error('Error en la consulta de: entryOrderRecordExistsByIdMas', error);
        throw error;
    }
};