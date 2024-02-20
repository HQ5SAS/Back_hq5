import { dbConnection } from './connection.js';

// OK

// Función para verificar si existe un registro en la tabla aplicar_convocatorias por zh_requisicion
export const applyCallRecordExistsByIdReq = async (reqId) => {
    try {
        const { results } = await dbConnection.query(`
            SELECT
                aplicar_convocatoria.id AS id2,
                CAST(aplicar_convocatoria.zh_id AS CHAR) AS id,
                CAST(hv.zh_id AS CHAR) AS id_hv,
                hv.num_documento AS documento,
                CONCAT(hv.primer_apellido, ' ', hv.primer_nombre) AS nombre,
                aplicar_convocatoria.estado_postulacion AS estado
            FROM 
                aplicar_convocatoria
            JOIN 
                hv ON aplicar_convocatoria.zh_hv = hv.zh_id
            WHERE 
                aplicar_convocatoria.zh_requisicion = ?
                AND aplicar_convocatoria.zh_orden_contratacion IS NULL
                AND aplicar_convocatoria.estado_postulacion NOT IN ('Rechazado')
                AND aplicar_convocatoria.rechazar_candidato = 0;
        `, [reqId]);

        return results;
    } catch (error) {
        console.error('Error en la consulta de: applyCallRecordExistsByIdReq', error);
        throw error;
    }
};
