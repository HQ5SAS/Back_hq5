import { createErrorResponse, createCustomersResponse } from '../../Tools/utils.js';
import { updateContactAndConfirmation, addLegalTransportSubsidy, setFieldsValue, processZohoResponse } from '../../Lib/EntryOrder/entryOrderSuccess.function.js';

// Funcion para acceder al metodo de respuesta estandar en utils.js
async function logAndRespond(res, message, statusCode, data = null) {
    const response = createCustomersResponse(message, statusCode, data);
    res.status(statusCode).json(response);
    return response;
}

// Funcion para procesar el succes del formulario del frontend
async function processForm(req, res) {
    try {
        const data = req.body.data;

        if (!data) {
            return logAndRespond(res, "El formato de la solicitud no es válido", 400);
        }

        // Validar el tipo de formulario (Orden ingreso)
        if(data.orden_ingreso)
        {
            console.log("Orden ingreso");
            const { campos } = data.orden_ingreso;
            await updateContactAndConfirmation(campos);
            await addLegalTransportSubsidy(campos);
            const response = await setFieldsValue(campos);
            const responseZoho = await processZohoResponse(campos, response);;
            console.log(responseZoho);

            if (responseZoho.error && responseZoho.error[0] && responseZoho.error[0].alert_message) {
                console.log(responseZoho.error[0].alert_message);
            } else {
                console.log('No se encontró un mensaje de error');
            }
            
            return logAndRespond(res, response.message, response.status, responseZoho);
        }

    } catch (error) {
        console.error('Error al cargar los valores para el formulario web en zoho:', error);
        const errorResponse = createErrorResponse('Error interno del servidor', 500);
        return res.status(errorResponse.statusCode).json(errorResponse);
    }
}

// Controlador para procesar los datos del frontend en el success del formulario (Guardar data)
const requestsController = { processForm };
export default requestsController;