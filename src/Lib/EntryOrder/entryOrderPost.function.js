import { validateJson } from './validateObject.function.js';
import { createNewReqObject, createNewBenObject } from './createObject.function.js';
import { transformJson } from './transformObject.function.js';

export async function setFieldsValue(data) {
    try {
        // Validar objeto principal
        const validationResult = await validateJson(data);

        if (validationResult.valid) {
            // Transformar beneficios de contrato
            data.beneficios_contrato = await Promise.all(data.beneficios_contrato.map(async beneficio => await transformJson(await createNewBenObject(beneficio))));

            // Transformar objeto principal
            const combinedObject = await transformJson(await createNewReqObject(data));

            return {
                status: 200,
                message: "Solicitud completa",
                data: combinedObject
            };

        } else {
            return {
                status: 400,
                message: "Faltan claves en el JSON",
                data: { missingKeys: validationResult.missingKeys }
            };
        }
        
    } catch (error) {
        // Manejar errores
        console.error("Error inesperado:", error);
        return {
            status: 500,
            message: "Error inesperado",
            data: null
        };
    }
}