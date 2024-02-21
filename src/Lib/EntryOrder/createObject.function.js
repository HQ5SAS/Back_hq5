// Crea un nuevo objeto para representar una requisición.
async function createNewReqObject(data) {
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
        naturaleza_cc,
        proyecto_cc,
        linea_negocio_cc,
        area_cc,
        sub_centro_cc
    } = data;

    // Crear el nuevo objeto de requisición
    const newObject = {
        requisicion: requisicion.id,
        postulados: postulados.map(postulado => postulado.id),
        centro_costo: centro_costo.id,
        periodicidad: centro_costo.periodicidad,
        dias_pago: centro_costo.dias_pago,
        fecha_ingreso,
        sitio_trabajo,
        sitio_presentacion,
        nivel_riesgo,
        salario_basico: salario_basico.valor,
        salario_integral,
        sabado_habil,
        tipo_contrato: tipo_contrato.id,
        tipo_jornada: tipo_jornada.id,
        observaciones,
        naturaleza_cc: naturaleza_cc.id,
        proyecto_cc: proyecto_cc.id,
        linea_negocio_cc: linea_negocio_cc.id,
        area_cc: area_cc.id,
        sub_centro_cc: sub_centro_cc.id
    };

    return { "data": newObject };
}

// Crear un nuevo objeto para representar un beneficio
async function createNewBenObject(data) {
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

    return { "data": newObject };
}

export { createNewReqObject, createNewBenObject };