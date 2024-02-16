import { createErrorResponse, createCustomersResponse } from '../../Tools/utils.js';
import validateJson from '../../Lib/EntryOrder/validateObject.function.js';
import { createNewReqObject, createNewBenObject } from '../../Lib/EntryOrder/createObject.function.js';
import { transformJson } from '../../Lib/EntryOrder/transformObject.function.js';

async function logAndRespond(res, message, statusCode, data = null) {
    const response = createCustomersResponse(message, statusCode, data);
    res.status(statusCode).json(response);
    return response;
}

async function processForm(req, res) {
    try {
        const requestBody = req.body;
        const data = requestBody.data?.orden_ingreso?.campos;

        if (!data) {
            return logAndRespond(res, "El formato de la solicitud no es válido", 400);
        }

        const validationResult = await validateJson(data);

        if (validationResult.valid) {
            
            const newReqObj = await createNewReqObject(data);
            const newReqObjT = await transformJson(newReqObj);

            const combinedArray = [];
            combinedArray.push(newReqObjT);
            // Crear registro en Zoho con el objeto newReqObjT

            for (const beneficio of data.beneficios_contrato) {
                const newBenObj = await createNewBenObject(beneficio);
                const newBenObjT = await transformJson(newBenObj);
                // Crear registro en Zoho con el objeto newBenObjT
                combinedArray.push(newBenObjT);
            }

            logAndRespond(res, "Solicitud completa", 200, combinedArray);

        } else {
            logAndRespond(res, "Faltan claves en el JSON", 400, { missingKeys: validationResult.missingKeys });
        }

    } catch (error) {
        console.error('Error al cargar los valores para el formulario web en zoho:', error);
        const errorResponse = createErrorResponse('Error interno del servidor', 500);
        return res.status(errorResponse.statusCode).json(errorResponse);
    }
}

const requestsController = { processForm };
export default requestsController;