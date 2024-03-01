import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import {requestPost} from './utils.js';
import { createErrorResponse } from './utils.js';

dotenv.config({ path: '.env' });

// Función para validar el token de Woztell
export const validateToken = async (req, res, next) => {
    try {
        const secretKey = process.env.WZ_SECRET_KEY;
        const token = req.header('Authorization');

        if (!token) {
            const response = createErrorResponse('Token no proporcionado', 401);
            return res.status(401).json(response);
        }

        const decoded = await jwt.verify(token.replace('Bearer ', ''), secretKey);
        next();
        
    } catch (error) {
        const response = createErrorResponse('Token inválido', 401);
        return res.status(401).json(response);
    }
};

// Funcion para redireccionar al usuario de Woztell a través de los nodos de conversación con 4 argumentos (node, memberid, externalId, meta)
export const redirectMemberToNode = async (node, memberId = null, recipientId = null, metaData = {}) => {

    const { WZ_REDIRECT_MEMBER_TO_NODE, WZ_ACCESS_TOKEN, WZ_CHANNEL_CUST, WZ_TREE_CUST } = process.env;

    const data = {
        channelId: WZ_CHANNEL_CUST,
        memberId: memberId,
        recipientId: recipientId,
        redirect: {
            tree: WZ_TREE_CUST,
            nodeCompositeId: node,
            runPreAction: true,
            sendResponse: true,
            runPostAction: true
        },
        meta: metaData
    };

    try {
        const resultado = await requestPost(WZ_REDIRECT_MEMBER_TO_NODE, WZ_ACCESS_TOKEN, data);
        return resultado;
        
    } catch (error) {
        console.error('Error:', error.message);
    }
};

// Función para redirigir en Woztell según el nodo y los datos proporcionados por memberId
export function redirectWoztellByMemberId(node, memberId, additionalData = {}) {
    redirectMemberToNode(node, memberId, null, additionalData);
}

// Función para redirigir en Woztell según el nodo y los datos proporcionados por recipientId
export async function redirectWoztellByRecipientId(node, recipientId, additionalData = {}) {
    redirectMemberToNode(node, null, recipientId, additionalData);
}