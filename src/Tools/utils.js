import fetch from 'node-fetch';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { taskRecordExistsByName } from '../Database/task.query.js';

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

// Funcion para acceder al metodo de respuesta estandar createCustomersResponse
export async function logAndRespond(res, message, statusCode, data = null) {
    const response = createCustomersResponse(message, statusCode, data);
    res.status(statusCode).json(response);
    return response;
}

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

        const response = await respuesta.json();
        return response;

    } catch (error) {
        console.error('Error al realizar la solicitud:', error);
        throw error;
    }
}

// Funcion para complementar la URL del frontend con token (JWT contiene la data)
export const createURLWithToken = (token = null) => {
    return `?token=${token}`;
};

// Datos por defecto del token del frontend
const SECRET_KEY = process.env.SECRET_KEY_SERVICE;
const DEFAULT_TOKEN_DATA = {
    user: process.env.USER_SERVICE,
    role: process.env.ROL_SERVICE,
    expiresIn: '12h'
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

// Función para generar un nuevo token del frontend
export const generateToken = (requestId = null, recordId = null, taskId = null) => {
    const tokenData = { 
        ...DEFAULT_TOKEN_DATA, 
        exp: Date.now() + parseDuration(DEFAULT_TOKEN_DATA.expiresIn), 
        requestId: requestId, 
        recordId: recordId,
        taskId: taskId
    };

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

// Middleware para verificar el token del frontend
export const verifyTokenMiddleware = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            const response = createErrorResponse('Token no proporcionado', 401);
            return res.status(401).json(response);
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

// Funcion para obtener el id de la tarea en la tabla tarea_bot por nombre
export const consultTask = async (taskName) => {
    try {
        return await taskRecordExistsByName(taskName);
        
    } catch (error) {
        console.error('Error al consultar la tabla tarea_bot:', error);
        throw createErrorResponse('Error al consultar la tabla tarea_bot', 400);
    }
}