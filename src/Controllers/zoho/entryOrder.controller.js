import { createErrorResponse, createCustomersResponse, generateToken, createURLWithToken, consultTask } from '../../Tools/utils.js';
import { entryOrder } from '../../Tools/taskName.js';
import { redirectMemberToNode } from '../../Tools/woztell.js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

// Funcion para acceder al metodo de respuesta estandar en utils.js
async function logAndRespond(res, message, statusCode, data = null) {
    const response = createCustomersResponse(message, statusCode, data);
    res.status(statusCode).json(response);
    return response;
}

// Funcion recursiva para notificacion de ordenes de ingreso masivas al cliente por Whatsapp
async function notifyEntryOrderCustomer(req, res, node) {
    try {
        const { data } = req.body;

        if (!data || !data.message || !data.id || !data.recipientId) {
            return logAndRespond(res, 'Las claves (message), (id) o (recipientId) no se encontraron en el cuerpo de la solicitud', 400);
        }
            
        const { id: taskId } = await consultTask(entryOrder);
        const token = generateToken(null, data.id, taskId);
        req.body.data.path = `orden-ingreso${createURLWithToken(token)}`;

        redirectMemberToNode(node, null, data.recipientId, req.body);
        logAndRespond(res, 'Solicitud procesada correctamente', 200);

    } catch (error) {
        console.error(`Error en la notificación de WhatsApp para la orden de ingreso (${node}):`, error);
        const errorResponse = createErrorResponse('Error interno del servidor', 500);
        res.status(errorResponse.statusCode).json(errorResponse);
    }
}

// Controlador para notificacion de ordenes de ingreso masivas al cliente por Whatsapp
const requestsController = {
    notifyCreateEntryOrderCustomer: (req, res) => notifyEntryOrderCustomer(req, res, process.env.WZ_NODE_CRE_ENTRY_ORDER),
    notifyModifyEntryOrderCustomer: (req, res) => notifyEntryOrderCustomer(req, res, process.env.WZ_NODE_MOD_ENTRY_ORDER),
    notifyReviewEntryOrderCustomer: (req, res) => notifyEntryOrderCustomer(req, res, process.env.WZ_NODE_REV_ENTRY_ORDER)
};

export default requestsController;
