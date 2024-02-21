import { dbConnection } from './connection.js';

// OK

// Función para obtener los beneficios del contrato por requisicion
export const contractBenefitRecordExistsByIdReq = async (reqId) => {
    try {
        const { results } = await dbConnection.query(`
        SELECT 
            beneficio_contrato.id AS id2, 
            CAST(beneficio_contrato.zh_id AS CHAR) AS id,
            CAST(beneficio_contrato.zh_grupo AS CHAR) AS id_grupo,
            grupo.nombre AS n_grupo,
            CAST(beneficio_contrato.zh_concepto AS CHAR) AS id_concepto,
            concepto.nombre AS n_concepto,
            beneficio_contrato.valor AS valor,
            beneficio_contrato.metodologia_pago AS m_pago,
            CAST(requisicion.zh_id AS CHAR) AS id_req,
            CAST(perfil.zh_id AS CHAR) AS id_perfil,
            perfil.nombre AS n_perfil
        FROM 
            beneficio_contrato
        JOIN 
            grupo ON beneficio_contrato.zh_grupo = grupo.zh_id
        JOIN 
            concepto ON beneficio_contrato.zh_concepto = concepto.zh_id
        JOIN 
            requisicion ON beneficio_contrato.zh_requisicion = requisicion.zh_id
        JOIN
            perfil ON requisicion.zh_perfil = perfil.zh_id
        WHERE 
            zh_requisicion = ?;
        `, [reqId]);

        return results;
    } catch (error) {
        console.error('Error en la consulta de: contractBenefitRecordExistsByIdReq', error);
        throw error;
    }
};
