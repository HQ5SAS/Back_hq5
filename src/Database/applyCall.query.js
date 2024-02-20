import { dbConnection } from './connection.js';

// Función para verificar si existe un registro en la tabla aplicar_convocatorias por zh_requisicion
export const applyCallRecordExistsByIdReq = (reqId) => {
    return new Promise((resolve, reject) => {
        const sqlQuery = `
            SELECT
                aplicar_convocatoria.id AS id2,
                CONVERT(aplicar_convocatoria.zh_id, CHAR) AS id,
                CONVERT(hv.zh_id, CHAR) AS id_hv,
                hv.num_documento AS documento,
                CONCAT(hv.primer_apellido, ' ', hv.primer_nombre) AS nombre,
                aplicar_convocatoria.estado_postulacion AS estado
            FROM 
                aplicar_convocatoria
            JOIN 
                hv ON aplicar_convocatoria.zh_hv = hv.zh_id
            WHERE 
                aplicar_convocatoria.zh_requisicion = ?
                AND aplicar_convocatoria.zh_orden_contratacion IS NULL;
                AND aplicar_convocatoria.estado_postulacion NOT IN ('Rechazado', 'No validado');
        `;
  
        dbConnection.query(sqlQuery, [reqId], (results, fields) => {
            if (results) {
                resolve(results);
            } else {
                reject('Error en la consulta de: applyCallRecordExistsByIdReq');
            }
        });
    });
};