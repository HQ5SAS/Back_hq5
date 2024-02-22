import { dbConnection } from './connection.js';

// Función para consultar un registro en la tabla orden_ingreso_masivo por id
export const entryOrderMRecordExistsById = async (entryOrderMId) => {
    try {
        const sql = `
            SELECT 
                id AS id2, 
                CAST(zh_id AS CHAR) AS id,
                CAST(zh_requisicion AS CHAR) AS id_requisicion,
                periodicidad_pago AS periodicidad,
                fecha_ingreso AS fecha_ingreso,
                sitio_trabajo AS sitio_trabajo,
                sitio_presentacion AS sitio_presentacion,
                nivel_riesto AS nivel_riesgo,
                salario_base AS salario,
                salario_integral AS salario_integral,
                sabado_habil AS sabado_habil,
                observaciones AS observaciones,
                CAST(zh_naturaleza_centro_costo AS CHAR) AS naturaleza_centro_costo,
                CAST(zh_proyecto AS CHAR) AS proyecto,
                CAST(zh_linea_negocio AS CHAR) AS linea_negocio,
                CAST(zh_area AS CHAR) AS area,
                CAST(zh_subcentro_costo AS CHAR) AS sub_centro_costo,
                CAST(zh_centro_costo AS CHAR) AS centro_costo
            FROM
                orden_ingreso_masivo 
            WHERE 
                zh_id = ?
            LIMIT 
                1
        `;

        const params = [entryOrderMId];
        const { results } = await dbConnection.query(sql, params);
        return results;
        
    } catch (error) {
        console.error('Error en la consulta de: entryOrderMRecordExistsById', error);
        throw error;
    }
};