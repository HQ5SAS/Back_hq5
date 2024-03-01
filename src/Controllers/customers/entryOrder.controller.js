import { createErrorResponse, logAndRespond } from '../../Tools/utils.js';
import { patchZohoCreator } from '../../Tools/zoho.js';

// Función común para actualizar el estado en Zoho
async function updateZohoStatus(req, res, status, actionDescription) {
    try {
        const { data } = req.body;

        if (!data) {
            return logAndRespond(res, `Clave (data) no encontrada en el cuerpo de la solicitud para ${actionDescription}`, 400);
        }

        // Actualizar Zoho y desde Zoho se actualiza las tablas de la db
        await patchZohoCreator(`Orden_de_ingreso_Masivo`, `${data.id}`, { data: { estado_ord_ing_mas: status } });

        return logAndRespond(res, `Solicitud de ${actionDescription} procesada correctamente`, 200);

    } catch (error) {
        console.error(`Error en la ${actionDescription} de WhatsApp para la orden de ingreso`, error);
        const errorResponse = createErrorResponse('Error interno del servidor', 500);
        res.status(errorResponse.statusCode).json(errorResponse);
    }
}

// Funcion para confirmar ordenes de ingreso a traves del bot de Whatsapp
async function confirmEntryOrderCustomer(req, res) {
    await updateZohoStatus(req, res, 'Confirmado cliente', 'confirmación');
}

// Funcion para notificar que el cliente requiere soporte en las ordenes de ingreso masivas a traves de whatsapp
async function supportEntryOrderCustomer(req, res) {
    await updateZohoStatus(req, res, 'Contactar asesor', 'solicitud de asesoría');
}

// Controlador para solicitud de confirmacion y soporte de ordenes de ingreso masivas
const requestsController = { confirmEntryOrderCustomer, supportEntryOrderCustomer };
export default requestsController;