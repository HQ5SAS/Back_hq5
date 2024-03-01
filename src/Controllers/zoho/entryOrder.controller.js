import { createErrorResponse, logAndRespond, generateToken, createURLWithToken, consultTask } from '../../Tools/utils.js';
import { entryOrder } from '../../Tools/taskName.js';
import { redirectWoztellByRecipientId } from '../../Tools/woztell.js';
import { consultRecordWz } from '../../Lib/wz.function.js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

// Funcion recursiva para notificacion de ordenes de ingreso masivas al cliente por Whatsapp ejecutadas desde Zoho
async function notifyEntryOrderCustomer(req, res, node) {
    try {
        const { data } = req.body;

        if (!data || !data.message || !data.id || !data.recipientId) {
            return logAndRespond(res, 'Las claves (message), (id) o (recipientId) no se encontraron en el cuerpo de la solicitud', 400);
        }
            
        const { id: taskId } = await consultTask(entryOrder);
        const token = generateToken(null, data.id, taskId);
        const path = `orden-ingreso${createURLWithToken(token)}`; 
        
        const dataSend = {
            id: data.id,
            recipientId: data.recipientId,
            url: data.url,
            message: data.message,    
            path: path,
        }
        
        const response = await redirectWoztellByRecipientId(node, dataSend.recipientId, dataSend);
        await consultRecordWz(response.member, data.recipientId, process.env.WZ_APP);
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
