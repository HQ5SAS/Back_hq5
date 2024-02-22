import { createErrorResponse, createCustomersResponse } from '../../Tools/utils.js';
import { postZohoCreator } from '../../Tools/zoho.js';
import { setFieldsValue } from '../../Lib/EntryOrder/entryOrderPost.function.js';
import { consultRecordWzById } from '../../Lib/woztell.function.js';

async function logAndRespond(res, message, statusCode, data = null) {
    const response = createCustomersResponse(message, statusCode, data);
    res.status(statusCode).json(response);
    return response;
}

async function processForm(req, res) {
    try {
        const requestBody = req.body;
        const data = requestBody.data;

        if (!data) {
            return logAndRespond(res, "El formato de la solicitud no es válido", 400);
        }

        // Validar el tipo de formulario (Orden ingreso)
        if(requestBody.data.orden_ingreso)
        {
            // Convertir el contacto a celular
            const cel = await consultRecordWzById(requestBody.data.orden_ingreso.campos.contacto);
            requestBody.data.orden_ingreso.campos.contacto = cel.externalId;
            requestBody.data.orden_ingreso.campos.tipo_confirmacion = "Confirmacion por Whatsapp";
            const response = await setFieldsValue(requestBody);
            let responseZoho = {};
            
            console.log("\n▶ Validando proceso si es creacion o edicion ...");
            if(requestBody.data.orden_ingreso.campos.id !== null)
            {
                console.log('    ▶ Proceso de edicion');
                // Insertar registros ... Aplica para las prediligenciadas y las no prediligenciadas
                // Insertar orden de ingreso masivo
                console.log('       ▶ Modificando registro orden ingreso...');
                // Insertar beneficios de contrato
                console.log('       ▶ Modificando registros beneficios ...\n');
            }
            else
            {
                // Insertar orden de ingreso masivo
                console.log('    ▶ Proceso de creacion');
                console.log('       ▶ Creando registro orden ingreso\n');
                // Llamar la funcion de insercion de registros
                responseZoho = await postZohoCreator('Ordenes_Contrataci_n_Masivo', response.data);
            }

            return logAndRespond(res, response.message, response.status, responseZoho);
        }

    } catch (error) {
        console.error('Error al cargar los valores para el formulario web en zoho:', error);
        const errorResponse = createErrorResponse('Error interno del servidor', 500);
        return res.status(errorResponse.statusCode).json(errorResponse);
    }
}

const requestsController = { processForm };
export default requestsController;