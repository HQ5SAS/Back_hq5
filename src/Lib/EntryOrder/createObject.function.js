async function createNewReqObject(data) {

    const newObject = {
        requisicion: data.requisicion.id,
        postulados: data.postulados.map(postulado => postulado.id),
        centro_costo: data.centro_costo.id,
        periodicidad: data.centro_costo.periodicidad,
        dias_pago: data.centro_costo.dias_pago,
        fecha_ingreso: data.fecha_ingreso,
        sitio_trabajo: data.sitio_trabajo,
        sitio_presentacion: data.sitio_presentacion,
        nivel_riesgo: data.nivel_riesgo,
        salario_basico: data.salario_basico.valor,
        salario_integral: data.salario_integral,
        sabado_habil: data.sabado_habil,
        tipo_contrato: data.tipo_contrato.id,
        tipo_jornada: data.tipo_jornada.id,
        observaciones: data.observaciones,
        naturaleza_cc: data.naturaleza_cc.id,
        proyecto_cc: data.proyecto_cc.id,
        linea_negocio_cc: data.linea_negocio_cc.id,
        area_cc: data.area_cc.id,
        sub_centro_cc: data.sub_centro_cc.id
    };

    const reqObject = { "data": newObject};
    return reqObject;
}

async function createNewBenObject(data) {

    const newObject = {
        grupo: data.grupo.id,
        concepto: data.concepto.id,
        valor: data.valor,
        metodologia_pago: data.metodologia_pago,
    };

    const newObjectOut = { "data": newObject};
    return newObjectOut;
}

export { createNewReqObject, createNewBenObject };