// Validacion de Json
async function validateJson(data) {

    // Keys esperadas en el objeto principal
    const expectedKeys = [
        "requisicion",
        "postulados",
        "centro_costo",
        "fecha_ingreso",
        "sitio_trabajo",
        "sitio_presentacion",
        "nivel_riesgo",
        "salario_basico",
        "salario_integral",
        "sabado_habil",
        "tipo_contrato",
        "tipo_jornada",
        "observaciones",
        "naturaleza_cc",
        "proyecto_cc",
        "sub_centro_cc",
        "linea_negocio_cc",
        "area_cc",
        "beneficios_contrato"
    ];

    // Keys esperadas en objetos anidados
    const expectedNestedKeys = {
        "requisicion": ["id"],
        "centro_costo": ["id", "periodicidad", "dias_pago"],
        "salario_basico": ["valor"],
        "tipo_contrato": ["id"],
        "tipo_jornada": ["id"]
    };

    // Validación adicional para otras claves
    const validationRules = {
        "postulados": {
            isArray: true,
            hasRequiredField: "id"
        }
    };

    // Función para validar claves anidadas
    const validateNestedKeys = (nestedObject, expectedNestedKeys) =>
        expectedNestedKeys.filter(key => !Object.keys(nestedObject).includes(key));

    // Función para validar una clave específica según sus reglas
    const validateField = (fieldName, fieldValue, rules) => {
        if (rules.isArray && (!Array.isArray(fieldValue) || fieldValue.length === 0)) {
            console.log(`La lista ${fieldName} debe tener al menos un elemento`);
            return false;
        }

        if (rules.hasRequiredField && !fieldValue[0]?.hasOwnProperty(rules.hasRequiredField)) {
            console.log(`El elemento en la lista ${fieldName} debe tener la clave "${rules.hasRequiredField}"`);
            return false;
        }

        return true;
    };

    // Claves reales presentes en el objeto data
    const keysInData = Object.keys(data);

    // Filtra las claves esperadas que no están presentes en el objeto data
    const missingKeys = expectedKeys.filter(key => {
        if (keysInData.includes(key)) {

            // Si la clave es un objeto anidado, valida sus claves internas
            if (typeof data[key] === 'object' && expectedNestedKeys[key]) {
                const missingNestedKeys = validateNestedKeys(data[key], expectedNestedKeys[key]);
                if (missingNestedKeys.length > 0) {
                    console.log(`Faltan claves en el objeto ${key}: ${missingNestedKeys.join(', ')}`);
                    return true;
                }
            } else if (validationRules[key] && !validateField(key, data[key], validationRules[key])) {
                return true;
            }
            return false;
        }
        return true;
    });

    // Retorna un objeto indicando si el objeto data es válido y las claves faltantes
    return {
        valid: missingKeys.length === 0,
        missingKeys: missingKeys
    };
}

export { validateJson };