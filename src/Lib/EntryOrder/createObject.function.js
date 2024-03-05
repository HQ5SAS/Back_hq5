import { formatDate } from '../../Tools/date.js';

// Crea un nuevo objeto para representar una requisición
export async function createNewReqObject(data) {
    try {
        const {
            requisicion,
            postulados,
            centro_costo,
            fecha_ingreso,
            sitio_trabajo,
            sitio_presentacion,
            nivel_riesgo,
            salario_basico,
            salario_integral,
            sabado_habil,
            tipo_contrato,
            tipo_jornada,
            observaciones,
            tipo_confirmacion,
            contacto_id,
            celular,
            naturaleza_cc,
            proyecto_cc,
            sub_centro_cc,
            linea_negocio_cc,
            area_cc,
            beneficios_contrato,
            estado
        } = data;

        // Formatear la fecha
        const formattedDate = formatDate(fecha_ingreso);
        
        // Formatear el celular
        let cel = celular.startsWith('+') ? celular : `+${celular}`;

        // Crear el nuevo objeto de requisición
        const newObject = {
            requisicion: requisicion.id,
            postulados: postulados.map(postulado => postulado.id),
            centro_costo: centro_costo.id,
            periodicidad: centro_costo.periodicidad,
            dias_pago: centro_costo.dias_pago,
            fecha_ingreso: formattedDate,
            sitio_trabajo,
            sitio_presentacion,
            nivel_riesgo,
            salario_basico: salario_basico.valor,
            salario_integral,
            sabado_habil,
            tipo_contrato: tipo_contrato.id,
            tipo_jornada: tipo_jornada.id,
            observaciones,
            tipo_confirmacion,
            contacto_id,
            celular: cel,
            naturaleza_cc: naturaleza_cc.id,
            proyecto_cc: proyecto_cc.id,
            sub_centro_cc: sub_centro_cc.id,
            linea_negocio_cc: linea_negocio_cc.id,
            area_cc: area_cc.id,
            beneficios_contrato,
            estado
        };

        return { "data": newObject };
        
    } catch (error) {
        console.error("Error al crear el objeto principal de orden de ingreso: ", error);
        throw new Error("Error al crear el objeto principal de orden de ingreso");
    }
}

// Crear un nuevo objeto para representar un beneficio
export async function createNewBenObject(data) {
    try {
        const {
            grupo,
            concepto,
            valor,
            metodologia_pago
        } = data;

        // Crear el nuevo objeto de beneficio
        const newObject = {
            grupo: grupo.id,
            concepto: concepto.id,
            valor,
            metodologia_pago
        };

        return newObject;
    
    } catch (error) {
        console.error("Error al crear nuevo objeto de beneficio:", error);
        throw new Error("Error al crear nuevo objeto de beneficio");
    }
}