import { validateJson } from './validateObject.function.js';
import { createNewReqObject, createNewBenObject } from './createObject.function.js';
import { transformJson } from './transformObject.function.js';

// Funcion para procesar el objeto de respuesta en el success del frontend
export async function setFieldsValue(data) {
    try {
        const validationResult = await validateJson(data);

        if (validationResult.valid) {
            data.beneficios_contrato = await Promise.all(data.beneficios_contrato.map(async beneficio => await transformJson(await createNewBenObject(beneficio))));
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
        console.error("Error inesperado:", error);
        return {
            status: 500,
            message: "Error inesperado",
            data: null
        };
    }
}