import { createErrorResponse, createCustomersResponse } from '../../Tools/utils.js';
import { getAccessToken } from '../../Tools/zoho.js';
import fetch from 'node-fetch';

async function logAndRespond(res, message, statusCode, data = null) {
    const response = createCustomersResponse(message, statusCode, data);
    res.status(statusCode).json(response);
    return response;
}

const BASE_URL_HQ5 = 'https://creator.zoho.com/api/v2.1/hq5colombia/hq5/report/';

const fetchData = async (apiUrl, criteria, accessToken, body) => {
    const url = `${apiUrl}/${criteria}`;

    try {
        const patchResponse = await fetch(url, {
            method: 'PATCH',
            headers: {
                'Authorization': `Zoho-oauthtoken ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        if (!patchResponse.ok) {
            console.error('Error en la solicitud PATCH:', patchResponse.statusText);
            return null;
        }

        return await patchResponse.json();

    } catch (error) {
        console.error('Error en la solicitud:', error.message);
        return null;
    }
};

async function confirmEntryOrderCustomer(req, res) {
    try {
        const { data } = req.body;

        if (!data) {
            return logAndRespond(res, 'Clave (data) no encontrada en el cuerpo de la solicitud', 400);
        }

        const accessToken = await getAccessToken();

        if (!accessToken) {
            console.log('No se pudo obtener el Access Token');
            return null;
        }

        // Actualizar Zoho y desde Zoho se actualiza las db
        const response = await fetchData(`${BASE_URL_HQ5}Orden_de_ingreso_Masivo`, `${data.id}`, accessToken, {data: { estado_ord_ing_mas: 'Confirmado cliente' }});

        logAndRespond(res, 'Solicitud procesada correctamente', 200);
        return;

    } catch (error) {
        console.error('Error en la confirmacion de WhatsApp para la orden de ingreso', error);
        const errorResponse = createErrorResponse('Error interno del servidor', 500);
        res.status(errorResponse.statusCode).json(errorResponse);
    }
}

async function supportEntryOrderCustomer(req, res) {
    try {

        const { data } = req.body;

        if (!data) {
            return logAndRespond(res, 'Clave (data) no encontrada en el cuerpo de la solicitud', 400);
        }

        const accessToken = await getAccessToken();

        if (!accessToken) {
            console.log('No se pudo obtener el Access Token');
            return null;
        }

        // Actualizar Zoho y desde Zoho se actualiza las db
        const response = await fetchData(`${BASE_URL_HQ5}Orden_de_ingreso_Masivo`, `${data.id}`, accessToken, {data: { estado_ord_ing_mas: 'Contactar asesor' }});

        logAndRespond(res, 'Solicitud procesada correctamente', 200);
        return;

    } catch (error) {
        console.error('Error en la confirmacion de WhatsApp para la orden de ingreso', error);
        const errorResponse = createErrorResponse('Error interno del servidor', 500);
        res.status(errorResponse.statusCode).json(errorResponse);
    }
}

const requestsController = { confirmEntryOrderCustomer, supportEntryOrderCustomer };
export default requestsController;
