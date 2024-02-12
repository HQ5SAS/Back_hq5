import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import {requestPost} from './utils.js';

dotenv.config({ path: '.env' });

// Función para validar el token de Woztell
export const validateToken = async (req, res, next) => {
    try{
        const secretKey = process.env.WZ_SECRET_KEY;
        const token = req.header('Authorization');
        if (!token) {
            return res.status(401).json({ error: true, statusCode: 401, message: 'Token no proporcionado', data: null });
        }
        const decoded = await new Promise((resolve, reject) => {
            jwt.verify(token.replace('Bearer ', ''), secretKey, (err, decoded) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(decoded);
                }
            });
        });
        next();
    } catch (error) {
        return res.status(401).json({ error: true, statusCode: 401, message: 'Token inválido', data: null });
    }
};

// Funcion para redireccionar al usuario de Woztell a través de los nodos de conversación con 4 argumentos (node, memberid, externalId, meta)
export const redirectMemberToNode = async (node, memberId = null, externalId = null, metaData) => {

    const { WZ_REDIRECT_MEMBER_TO_NODE, WZ_ACCESS_TOKEN, WZ_CHANNEL_CUST, WZ_TREE_CUST } = process.env;

    const data = {
        channelId: WZ_CHANNEL_CUST,
        memberId,
        recipientId: externalId,
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
    } catch (error) {
        console.error('Error:', error.message);
    }
};