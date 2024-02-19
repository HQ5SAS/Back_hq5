import { createErrorResponse, createCustomersResponse } from '../../Tools/utils.js';
import { redirectMemberToNode } from '../../Tools/woztell.js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

async function logAndRespond(res, message, statusCode, data = null) {
    const response = createCustomersResponse(message, statusCode, data);
    res.status(statusCode).json(response);
    return response;
}

async function notifyEntryOrderCustomer(req, res, node) {
    try {
        const { data } = req.body;

        if (!data || !data.message || !data.id || !data.recipientId) {
            const errorMessage = 'Las claves (message), (id) o (recipientId) no se encontraron en el cuerpo de la solicitud';
            return logAndRespond(res, errorMessage, 400);
        }

        redirectMemberToNode(node, null, data.recipientId, req.body);
        logAndRespond(res, 'Solicitud procesada correctamente', 200);
        return;

    } catch (error) {
        console.error(`Error en la notificación de WhatsApp para la orden de ingreso (${node}):`, error);
        const errorResponse = createErrorResponse('Error interno del servidor', 500);
        res.status(errorResponse.statusCode).json(errorResponse);
    }
}

const requestsController = {
    notifyCreateEntryOrderCustomer: (req, res) => notifyEntryOrderCustomer(req, res, process.env.WZ_NODE_CRE_ENTRY_ORDER),
    notifyModifyEntryOrderCustomer: (req, res) => notifyEntryOrderCustomer(req, res, process.env.WZ_NODE_MOD_ENTRY_ORDER),
    notifyReviewEntryOrderCustomer: (req, res) => notifyEntryOrderCustomer(req, res, process.env.WZ_NODE_REV_ENTRY_ORDER)
};

export default requestsController;
