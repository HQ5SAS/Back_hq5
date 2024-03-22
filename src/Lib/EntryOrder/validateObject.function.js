// Mensaje de error
const ERROR_MESSAGES = {
    requiredKeyMissing: key => `La clave "${key}" es requerida y está ausente.`,
    missingNestedKeys: (key, missingKeys) => `Faltan claves en el objeto ${key}: ${missingKeys.join(', ')}`,
    arrayMissingElement: fieldName => `La lista ${fieldName} debe tener al menos un elemento`,
    arrayElementMissingField: (fieldName, nestedField) => `El elemento en la lista ${fieldName} debe tener la clave "${nestedField}"`
};

// Funcion para validar el objeto Json de entrada en el post del frontend
export async function validateJson(data) {
    const expectedKeys = [
        "id",
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
        "tipo_confirmacion",
        "celular",
        "naturaleza_cc",
        "proyecto_cc",
        "sub_centro_cc",
        "linea_negocio_cc",
        "area_cc",
        "jefe_inmediato_cc",
        "empresa_asociada_cc",
        "beneficios_contrato"
    ];

    const expectedNestedKeys = {
        "requisicion": ["id"],
        "centro_costo": ["id", "periodicidad", "dias_pago"],
        "salario_basico": ["valor", "subsidio_transporte_required"],
        "tipo_contrato": ["id"],
        "tipo_jornada": ["id"]
    };

    const validationRules = {
        "postulados": {
            isArray: true,
            hasRequiredField: "id"
        }
    };

    const missingKeys = expectedKeys.filter(key => isKeyMissing(key, data, expectedNestedKeys, validationRules));

    return {
        valid: missingKeys.length === 0,
        missingKeys: missingKeys
    };
}

// Funcion para validar las llaves primarias y secundarias del objeto Json de entrada en el post del frontend
function isKeyMissing(key, data, expectedNestedKeys, validationRules) {

    if (!(key in data)) {
        console.log(ERROR_MESSAGES.requiredKeyMissing(key));
        return true;
    }

    const fieldValue = data[key];

    if (typeof fieldValue === 'object' && expectedNestedKeys[key]) {
        const missingNestedKeys = getMissingNestedKeys(fieldValue, expectedNestedKeys[key]);
        if (missingNestedKeys.length > 0) {
            console.log(ERROR_MESSAGES.missingNestedKeys(key, missingNestedKeys));
            return true;
        }
        
    } else if (validationRules[key] && !validateField(key, fieldValue, validationRules[key])) {
        return true;
    }

    return false;
}

// Funcion para validar las llaves anidadas del objeto Json de entrada en el post del frontend
function getMissingNestedKeys(fieldValue, expectedKeys) {
    return expectedKeys.filter(nestedKey => !(nestedKey in fieldValue));
}

// Funcion para validar los campos adicionales del objeto Json de entrada en el post del frontend
function validateField(fieldName, fieldValue, rules) {
    if (rules.isArray && !(Array.isArray(fieldValue) && fieldValue.length > 0)) {
        console.log(ERROR_MESSAGES.arrayMissingElement(fieldName));
        return false;
    }

    if (rules.hasRequiredField && !(fieldValue[0]?.hasOwnProperty(rules.hasRequiredField))) {
        console.log(ERROR_MESSAGES.arrayElementMissingField(fieldName, rules.hasRequiredField));
        return false;
    }

    return true;
}