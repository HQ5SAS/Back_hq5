import { createErrorResponse, logAndRespond } from '../../Tools/utils.js';
import { patchZohoCreator, logWhatsAppCustomerMessages } from '../../Tools/zoho.js';
import { nameEntryOrder } from '../../Tools/taskName.js';
import { consultEntryOrderMById } from './../../Lib/EntryOrder/entryOrderQuery.function.js';

// Función común para actualizar el estado en Zoho
async function updateZohoStatus(req, res, dataFields, actionDescription) {
    try {
        const { data } = req.body;

        // Verificar la existencia de 'data' y 'id'
        if (!data || !data.id) {
            const missingKey = !data ? 'data' : 'id';
            return logAndRespond(res, `Clave (${missingKey}) no encontrada en el cuerpo de la solicitud para ${actionDescription}`, 400);
        }

        // Actualizar Zoho y desde Zoho se actualiza las tablas de la db
        const response = await patchZohoCreator(`Orden_de_ingreso_Masivo`, `${data.id}`, dataFields);
        console.log(response);

        // Registrar la solicitud en el reporte de actividades de WhatsApp en Zoho Creator
        const entryOrderMRecord = await consultEntryOrderMById(data.id);
        if(entryOrderMRecord)
        {
            const messageData = {
                contactId: entryOrderMRecord.id_contacto,
                request: nameEntryOrder,
                type: 'Entrada',
                description: `El cliente realizo la ${actionDescription} para la ${nameEntryOrder} a traves de whatsapp`,
                whatsappMemberId: req.body.member._id,
                requestStatus: '1'
            };
        
            await logWhatsAppCustomerMessages(messageData);
        }

        return logAndRespond(res, `Solicitud de ${actionDescription} procesada correctamente`, 200);

    } catch (error) {
        console.error(`Error en la ${actionDescription} de WhatsApp para la orden de ingreso`, error);
        const errorResponse = createErrorResponse('Error interno del servidor', 500);
        res.status(errorResponse.statusCode).json(errorResponse);
    }
}

// Funcion para confirmar ordenes de ingreso a traves del bot de Whatsapp
async function confirmEntryOrderCustomer(req, res) {
    const dataFields = { data: { estado_ord_ing_mas: 'Confirmado cliente' } };
    await updateZohoStatus(req, res, dataFields, 'confirmación');
}

// Funcion para notificar que el cliente requiere soporte en las ordenes de ingreso masivas a traves de whatsapp
async function supportEntryOrderCustomer(req, res) {
    const dataFields = { data: { estado_ord_ing_mas: 'Contactar asesor' } };
    await updateZohoStatus(req, res,  dataFields, 'solicitud de asesoría');
}

// Controlador para solicitud de confirmacion y soporte de ordenes de ingreso masivas
const requestsController = { confirmEntryOrderCustomer, supportEntryOrderCustomer };
export default requestsController;