import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config({ path: '.env' });

// Funciones para metodos de respuesta estandarizados
export const createErrorResponse = (message, statusCode = 500, process = null, data = null) => {
    return {
        error: true,
        message,
        statusCode,
        process,
        data,
    };
};

export const createCustomersResponse = (message, statusCode = 200, process = null, data = null) => {
    return {
        error: false,
        statusCode,
        message,
        process,
        data,
    };
};

// Funcion para realizar solicitudes post con 3 argumento (url, accesstoken, datos o body)
export const requestPost = async (url, accessToken, data) => {
    try {

        if (!url || !accessToken) {
            throw new Error('URL y accessToken son obligatorios');
        }

        const respuesta = await fetch(`${url}?accessToken=${accessToken}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!respuesta.ok) {
            throw new Error(`Error en la solicitud: ${respuesta.status} ${respuesta.statusText}`);
        }

        const resultado = await respuesta.json();
        return resultado;

    } catch (error) {
        console.error('Error al realizar la solicitud:', error);
        throw error;
    }
}

// Funcion para complementar la URL del frontend con el id de la tabla de solicitud_wz
export const createURLWithIdCustomerIdTask = (customerId, taskId) => {
    const baseUrl = process.env.APP_FRONT;
    return `${baseUrl}?clienteId=${customerId}&tareaId=${taskId}`;
};

// Funcion para acortar las url con rebranly
export const shortenUrl  = async (title, destination) => {
    try {
        const apiUrl = process.env.REBRAN_URL;
        const apiKey = process.env.REBRAN_KEY;

        const requestBody = {
            title: title,
            slashtag: null,
            destination: destination,
        };

        const response = await fetch(`${apiUrl}?apikey=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        });

        const data = await response.json();
        return data;

    } catch (error) {
        console.error('Error:', error);
        throw new Error('Error al realizar la consulta en Rebrandly');
    }
}