// Transformar un objeto JSON de entrada del frontend según reglas de transformación predefinidas
export async function transformJson(obj) {

    // Reglas de transformación predefinidas Zoho Creator
    const transformationRules = {
        "requisicion": "id_req_lp_gen_req",
        "postulados": "postulaciones_lp_apli_conv",
        "centro_costo": "centro_costo_lp_cent_cost",
        "periodicidad": "periocidad_de_pago",
        "dias_pago": "dias_de_pago",
        "fecha_ingreso": "fecha_de_ingreso",
        "sitio_trabajo": "sitio_de_trabajo",
        "sitio_presentacion": "sitio_de_presentacion",
        "nivel_riesgo": "nivel_de_riesgo",
        "salario_basico": "salario_base",
        "salario_integral": "es_salario_integral",
        "sabado_habil": "sabado_habil",
        "tipo_contrato": "tipo_contrato_lp_agr_tip_cont",
        "tipo_jornada": "tipo_jornada_lp_agr_tip_jorn",
        "observaciones": "observaciones",
        "tipo_confirmacion": "tipo_confirmacion",
        "contacto_id": "contacto_lp",
        "celular": "celular",
        "naturaleza_cc": "natural_cen_cos_lp_nat_cen_cos",
        "proyecto_cc": "Proyecto_CU",
        "sub_centro_cc": "sub_centro_costo_lp_cen_cos",
        "linea_negocio_cc": "linea_neg_lp_lin_neg",
        "area_cc": "area_lp_area",
        "jefe_inmediato_cc": "Jefe_inmediato_lp",
        "empresa_asociada_cc": "Empresa_asociada_lp",
        "beneficios_contrato": "subform_beneficios_contrato",
        "grupo": "grupo",
        "concepto": "concepto",
        "valor": "valor",
        "metodologia_pago": "metodologia_de_pago",
        "estado": "estado_ord_ing_mas",
        "creacion": "creacion_ord_ing"
    };

    // Función recursiva para transformar un objeto anidado
    function transformObject(obj, rules) {
        const transformObj = {};

        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                if (rules[key]) {
                    if (typeof rules[key] === 'function') {
                        transformObj[rules[key]] = rules[key](obj[key]);
                    } else {
                        transformObj[rules[key]] = obj[key];
                    }
                } else if (typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
                    transformObj[key] = transformObject(obj[key], rules);
                } else {
                    transformObj[key] = obj[key];
                }
            }
        }

        return transformObj;
    }

    return transformObject(obj, transformationRules);
}