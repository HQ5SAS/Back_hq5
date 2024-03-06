import fetch from 'node-fetch';
import jwt from 'jsonwebtoken';
import { createErrorResponse } from './utils.js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

// Obtener access token para tener acceso a creator con multiples scopes
const getAccessToken = async () => {

    const url = process.env.ZH_URL_TOKEN;
    const data = {
        grant_type: 'refresh_token',
        client_id: process.env.ZH_CLIENTE_ID,
        client_secret: process.env.ZH_CLIENT_SECRET,
        refresh_token: process.env.ZH_REFRESH_TOKEN
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams(data).toString(),
        });

        if (response.ok) {
            const tokenData = await response.json();
            return tokenData.access_token;
        } else {
            return null;
        }

    } catch (error) {
        console.error('Error al obtener el access token:', error.message);
        return null;
    }   
}

// Función para validar el token de Zoho con el servidor
export const validateToken = async (req, res, next) => {
    try {
        const secretKey = process.env.ZH_SECRET_KEY;
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

// Funcion para crear registros en Zoho creator
export const postZohoCreator = async (form, data) => {

    const url = `https://creator.zoho.com/api/v2.1/hq5colombia/hq5/form/${form}`;
    const token = await getAccessToken(); 

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Zoho-oauthtoken ${token}`
            },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            return await response.json();
        } else {
            console.error('Error en la solicitud:', response.statusText);
            return null;
        }

    } catch (error) {
        console.error('Error al crear registro en Zoho Creator:', error.message);
    }
};

// Funcion para actualizar registros en Zoho creator (utilizando PATCH)
export const patchZohoCreator = async (report, recordId, data) => {

    const url = `https://creator.zoho.com/api/v2.1/hq5colombia/hq5/report/${report}/${recordId}`;
    const token = await getAccessToken();

    if (!token) {
        console.log('No se pudo obtener el Access Token');
        return null;
    }

    try {
        const response = await fetch(url, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Zoho-oauthtoken ${token}`
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            console.error('Error en la solicitud:', response);
            return null;
        }

        return await response.json();

    } catch (error) {
        console.error('Error al actualizar registro en Zoho Creator:', error.message);
        return null;
    }
};

// Función para registrar un informe de mensajes de WhatsApp del cliente en Zoho Creator
export const logWhatsAppCustomerMessages = async (messageData) => {
    const keyMappings = {
        contactId: 'contacto_whats_lp_cont',
        request: 'solicitud_whats',
        type: 'tipo_whats',
        description: 'Descripcion',
        whatsappMemberId: 'member_id_whats',
        requestStatus: 'estado_solicitud_whats'
    };

    const requiredKeys = Object.keys(keyMappings);
    
    if (requiredKeys.every(key => messageData.hasOwnProperty(key))) {
        const transformedMessageData = Object.fromEntries(
            Object.entries(messageData)
                .filter(([key]) => requiredKeys.includes(key))
                .map(([key, value]) => [
                    keyMappings[key], 
                    value ? value.charAt(0).toUpperCase() + value.slice(1).toLowerCase() : value
                ])
        );
        const response = await postZohoCreator('Whatsapp', { data: transformedMessageData})
        console.log(response);

    } else {
        console.error('Error: The object does not contain all the required keys.');
    }
};