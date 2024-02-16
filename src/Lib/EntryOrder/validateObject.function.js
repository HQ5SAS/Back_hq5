// Validacion de Json
async function validateJson(data) {
    const expectedKeys = [
        "fecha_ingreso",
        "sitio_trabajo",
        "sitio_presentacion",
        "salario_integral",
        "sabado_habil",
        "observaciones",
        "centro_costo",
        "naturaleza_cc",
        "proyecto_cc",
        "linea_negocio_cc",
        "area_cc",
        "sub_centro_cc",
        "nivel_riesgo",
        "salario_basico",
        "tipo_contrato",
        "tipo_jornada",
        "requisicion",
        "postulados",
        "beneficios_contrato"
    ];

    const expectedNestedKeys = {
        "centro_costo": ["id", "periodicidad", "dias_pago"],
        "salario_basico": ["valor"],
        "tipo_contrato": ["id"],
        "tipo_jornada": ["id"],
        "requisicion": ["id"]
    };

    const validationRules = {
        "postulados": {
            isArray: true,
            hasRequiredField: "id"
        }
    };

    const validateNestedKeys = (nestedObject, expectedNestedKeys) => {
        const missingNestedKeys = expectedNestedKeys.filter(key => !Object.keys(nestedObject).includes(key));

        if (missingNestedKeys.length > 0) {
            return missingNestedKeys;

        } else {
            return [];
        }
    };

    const validateField = (fieldName, fieldValue, rules) => {
        if (rules.isArray) {
            if (!Array.isArray(fieldValue) || fieldValue.length === 0) {
                console.log(`La lista ${fieldName} debe tener al menos un elemento`);
                return false;
            }
        }

        if (rules.hasRequiredField) {
            if (!fieldValue[0]?.hasOwnProperty(rules.hasRequiredField)) {
                console.log(`El elemento en la lista ${fieldName} debe tener la clave "${rules.hasRequiredField}"`);
                return false;
            }
        }

        return true;
    };

    const keysInData = Object.keys(data);

    const missingKeys = expectedKeys.filter(key => {
        if (keysInData.includes(key)) {
            if (typeof data[key] === 'object' && expectedNestedKeys[key]) {
                const nestedKeys = expectedNestedKeys[key];
                const missingNestedKeys = validateNestedKeys(data[key], nestedKeys);

                if (missingNestedKeys.length > 0) {
                    console.log(`Faltan claves en el objeto ${key}: ${missingNestedKeys.join(', ')}`);
                    return true;
                }
            } else if (validationRules[key]) {
                if (!validateField(key, data[key], validationRules[key])) {
                    return true;
                }
            }
            return false;
        }
        return true;
    });

    if (missingKeys.length > 0) {
        return {
            valid: false,
            missingKeys: missingKeys
        };

    } else {
        return {
            valid: true
        };
    }
}

export default validateJson;