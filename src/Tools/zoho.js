import fetch from 'node-fetch';
import jwt from 'jsonwebtoken';
import { createErrorResponse } from './utils.js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

// Obtener access token para tener acceso a creator con multiples scopes
export const getAccessToken = async () => {

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
            const accessToken = tokenData.access_token;
            return accessToken;
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