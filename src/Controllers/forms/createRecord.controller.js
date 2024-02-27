import { createErrorResponse, createCustomersResponse } from '../../Tools/utils.js';
import { postZohoCreator, patchZohoCreator } from '../../Tools/zoho.js';
import { setFieldsValue } from '../../Lib/EntryOrder/entryOrderPost.function.js';
import { consultContactById } from '../../Lib/contact.function.js';
import { getLegalTransportSubsidy } from '../../Lib/EntryOrder/contractBenefit.function.js';

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
            // Convertir el contacto a celular y añadir el tipo de confirmación
            const recordContact = await consultContactById(requestBody.data.orden_ingreso.campos.contacto);
            requestBody.data.orden_ingreso.campos.contacto = `57${recordContact[0].celular}`;
            requestBody.data.orden_ingreso.campos.tipo_confirmacion = "Confirmacion por Whatsapp";

            console.log(`Contacto: ${requestBody.data.orden_ingreso.campos.contacto}`);

            // Verificar si ya hay beneficios_contrato, si no existe, crear un array
            if (!requestBody.data.orden_ingreso.campos.beneficios_contrato) {
                requestBody.data.orden_ingreso.campos.beneficios_contrato = [];
            }

            // Verificar si ya existe el subsidio de transporte legal en la key beneficios contrato
            const legalTransportSubsidy = await getLegalTransportSubsidy();
            const existingLegalTransportSubsidy = requestBody.data.orden_ingreso.campos.beneficios_contrato.find(
                beneficio => beneficio.grupo.id === legalTransportSubsidy.grupo.id &&
                            beneficio.concepto.id === legalTransportSubsidy.concepto.id
            );

            // Agregar el beneficio al principio de la lista (Subsidio de transporte legal, si aplica)
            if (!existingLegalTransportSubsidy && requestBody.data.orden_ingreso.campos.salario_basico.subsidio_transporte_required) {
                requestBody.data.orden_ingreso.campos.beneficios_contrato.unshift(legalTransportSubsidy);
            }

            // Procesar el objeto de solicitud para realizar la solicitud de respuesta a Zoho Creator
            const response = await setFieldsValue(requestBody.data.orden_ingreso.campos);
            console.log(`response: ${response}`);
            let responseZoho = {};
            
            // Valida el proceso si es creación o edición de registros de orden de ingreso masiva
            if(requestBody.data.orden_ingreso.campos.id !== null)
            {
                // Modificar orden de ingreso masivo
                console.log('Proceso de edicion');
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
                // responseZoho = await patchZohoCreator('Orden_de_ingreso_Masivo', requestBody.data.orden_ingreso.campos.id ,response.data);
            }
            else
            {
                // Insertar orden de ingreso masivo
                console.log('Proceso de creacion');
                // Llamar la funcion de insercion de registros
                // responseZoho = await postZohoCreator('Ordenes_Contrataci_n_Masivo', response.data);
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