import fetch from 'node-fetch';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

// Funciones para metodos de respuesta estandarizados
export const createErrorResponse = (message, statusCode = 500, data = null) => {
    return {
        error: true,
        statusCode,
        message,
        data,
    };
};

export const createCustomersResponse = (message, statusCode = 200, data = null) => {
    return {
        error: false,
        statusCode,
        message,
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

// Funcion para complementar la URL del frontend con el idCliente el idTask y el token
export const createURLWithIdCustomerIdTask = (customerId, taskId, token = null) => {
    const baseUrl = process.env.APP_FRONT;
    return `${baseUrl}?customer=${customerId}&task=${taskId}&token=${token}`;
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

// Datos por defecto del token
const SECRET_KEY = process.env.SECRET_KEY_SERVICE;
const DEFAULT_TOKEN_DATA = {
    user: process.env.USER_SERVICE,
    role: process.env.ROL_SERVICE,
    expiresIn: '1h'
};

// Función auxiliar para convertir la duración de caducidad del token a milisegundos
const parseDuration = (duration) => {
    const units = {
        'ms': 1,
        's': 1000,
        'm': 60 * 1000,
        'h': 60 * 60 * 1000,
        'd': 24 * 60 * 60 * 1000
    };

    const match = duration.match(/^(\d+)([smhd]?)$/);
    if (!match) {
        throw new Error('Formato de duración inválido');
    }

    const value = parseInt(match[1], 10);
    const unit = match[2] || 'ms';

    if (!units[unit]) {
        throw new Error('Unidad de tiempo inválida');
    }

    return value * units[unit];
};

// Función para generar un nuevo token
export const generateToken = () => {
    const tokenData = { ...DEFAULT_TOKEN_DATA, exp: Date.now() + parseDuration(DEFAULT_TOKEN_DATA.expiresIn) };
    const token = jwt.sign(tokenData, SECRET_KEY, { algorithm: 'HS256' });
    return token;
};

// Función para verificar el token
export const validateToken = async (token) => {
    try {
        const decoded = jwt.verify(token, SECRET_KEY);

        if (decoded.exp < Date.now()) {
            return { valid: false, status: 401, message: 'Token expirado' };
        }

        return { valid: true, decoded };

    } catch (error) {

        const errorTypes = {
            'TokenExpiredError': { message: 'Token expirado', status: 401 },
            'JsonWebTokenError': { message: 'Token inválido', status: 403 },
            'default': { message: 'Error desconocido', status: 403 }
        };
    
        const { message, status } = errorTypes[error.name] || errorTypes['default'];
    
        console.error(`Error al validar el token: ${error.message}`);
        return { valid: false, status, message };
    }
};

// Middleware para verificar el token
export const verifyTokenMiddleware = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: true, statusCode: 401, message: 'Token no proporcionado', data: null });
        }

        const tokenResult = await validateToken(token);

        if (!tokenResult.valid) {
            return res.status(tokenResult.status).json({ error: true, statusCode: tokenResult.status, message: tokenResult.message, data: null });
        }

        req.decoded = tokenResult.decoded;
        next();
        
    } catch (error) {
        console.error(`Error al procesar el token: ${error.message}`);
        return res.status(500).json({ error: true, statusCode: 500, message: 'Error interno del servidor', data: null });
    }
};