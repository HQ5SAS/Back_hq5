import { validateJson } from './validateObject.function.js';
import { createNewReqObject, createNewBenObject } from './createObject.function.js';
import { transformJson } from './transformObject.function.js';
import { consultContactById } from '../contact.function.js';
import { getLegalTransportSubsidy } from './contractBenefit.function.js';
import { postZohoCreator, patchZohoCreator } from '../../Tools/zoho.js';

// Funcion para actualizar el objeto de la orden de ingreso (estado)
export async function updateStatus(campos) {
    const approve = campos.aprobar !== undefined && campos.aprobar !== null ? campos.aprobar : false;
    campos.estado = approve ? "Confirmado cliente" : "Notificado edicion";
    campos.creacion = "Cliente";
}

// Funcion para actualizar el objeto de la orden de ingreso (contacto y tipo confirmacion)
export async function updateContactAndConfirmation(campos) {
    const { contacto } = campos;
    const [recordContact] = await consultContactById(contacto);

    if (recordContact) {
        campos.contacto_id = recordContact.id;
        campos.celular = `57${recordContact.celular}`;
        campos.tipo_confirmacion = "Confirmacion por Whatsapp";
    }
}

// Funcion para actualizar el subsidio de transporte legal en ordenes de ingreso masivas (subform_beneficios_contrato)
export async function addLegalTransportSubsidy(campos) {
    const legalTransportSubsidy = await getLegalTransportSubsidy();

    campos.beneficios_contrato = campos.beneficios_contrato || [];

    const existingLegalTransportSubsidy = campos.beneficios_contrato.find(
        beneficio => beneficio.grupo.id === legalTransportSubsidy.grupo.id &&
                      beneficio.concepto.id === legalTransportSubsidy.concepto.id
    );

    if (!existingLegalTransportSubsidy && campos.salario_basico.subsidio_transporte_required) {
        campos.beneficios_contrato.unshift(legalTransportSubsidy);
    }
}

// Función para eliminar campos nulos o undefined por lo general lookup's de Zoho Creator
function removeUndefinedAndNullFields(data) {
    const fieldsToRemove = [
        'centro_costo_lp_cent_cost',
        'contacto_lp',
        'natural_cen_cos_lp_nat_cen_cos',
        'proyecto_lp_proy',
        'sub_centro_costo_lp_cen_cos',
        'linea_neg_lp_lin_neg',
        'area_lp_area'
    ];

    fieldsToRemove.forEach(field => {
        if (data[field] === undefined || data[field] === null) {
            delete data[field];
        }
    });
}

// Función para procesar las respuestas de Zoho Creator de orden de ingreso masivo
export async function processZohoResponse(campos, response) {
    if (campos.id !== null) {
        console.log('Proceso de edicion');
        
        const {
            id_req_lp_gen_req, 
            postulaciones_lp_apli_conv, 
            nivel_de_riesgo, 
            sabado_habil,
            tipo_contrato_lp_agr_tip_cont, 
            tipo_jornada_lp_agr_tip_jorn, 
            tipo_confirmacion, 
            celular,
            creacion,
            ...editableData 
        } = response.data.data;

        removeUndefinedAndNullFields(editableData);

        const data = { "data": editableData };

        // Llamar la funcion de modificacion de registros
        return await patchZohoCreator('Orden_de_ingreso_Masivo', campos.id, data);
        
    } else {
        console.log('Proceso de creacion');
        
        // Llamar la funcion de insercion de registros
        return await postZohoCreator('Ordenes_Contrataci_n_Masivo', response.data);
    }
}

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