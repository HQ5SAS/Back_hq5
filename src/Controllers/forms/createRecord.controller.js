import { createErrorResponse, createCustomersResponse } from '../../Tools/utils.js';
import { postZohoCreator, patchZohoCreator } from '../../Tools/zoho.js';
import { setFieldsValue } from '../../Lib/EntryOrder/entryOrderPost.function.js';
import { consultContactById } from '../../Lib/contact.function.js';

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
            const recordContact = await consultContactById(requestBody.data.orden_ingreso.campos.contacto);
            requestBody.data.orden_ingreso.campos.contacto = `57${recordContact[0].celular}`;
            requestBody.data.orden_ingreso.campos.tipo_confirmacion = "Confirmacion por Whatsapp";
            const response = await setFieldsValue(requestBody);
            let responseZoho = {};
            
            console.log("\n▶ Validando proceso si es creacion o edicion ...");
            if(requestBody.data.orden_ingreso.campos.id !== null)
            {
                // Modificar orden de ingreso masivo
                console.log('    ▶ Proceso de edicion');
                console.log('       ▶ Modificando registro orden ingreso...');
                // Eliminar keys de elementos no editables por seguridad en la manipulación de los datos de las ordenes de ingreso
                delete response.data.data.id_req_lp_gen_req;
                delete response.data.data.postulaciones_lp_apli_conv;
                delete response.data.data.nivel_de_riesgo;
                delete response.data.data.sabado_habil;
                delete response.data.data.tipo_contrato_lp_agr_tip_cont;
                delete response.data.data.tipo_jornada_lp_agr_tip_jorn;
                delete response.data.data.tipo_confirmacion;
                delete response.data.data.celular;
                // Llamar la funcion de modificacion de registros
                responseZoho = await patchZohoCreator('Orden_de_ingreso_Masivo', requestBody.data.orden_ingreso.campos.id ,response.data);
            }
            else
            {
                // Insertar orden de ingreso masivo
                console.log('    ▶ Proceso de creacion');
                console.log('       ▶ Creando registro orden ingreso\n');
                // Llamar la funcion de insercion de registros
                console.log(response.data);
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