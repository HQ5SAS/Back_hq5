import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

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

// Función para redireccionar a un nodo al usuario (Customers)
export const redirectNodeToUser = async (recipientId = null, memberId = null, nodeCompositeId) => {
    const url = process.env.WZ_REDIRECT_MEMBER_TO_NODE;
    const accessToken = process.env.WZ_ACCESS_TOKEN;
    const channelId = process.env.WZ_CHANNEL_CUST;
    const tree = process.env.WZ_TREE_CUST;

    const data = {
        channelId: channelId,
        memberId: memberId,
        recipientId: recipientId,
        redirect: {
            tree: tree,
            nodeCompositeId: nodeCompositeId,
            runPreAction: true,
            sendResponse: true,
            runPostAction: true
        },
        meta: {}
    };

    try {
        const response = await fetch(`${url}?accessToken=${accessToken}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error(`Error en el servidor de Woztell: ${response}`);
        }

        const responseData = await response.json();

        // Almacenar en logs
        console.log(responseData);

    } catch (error) {
        console.error('Error en la solicitud de redirección de usuario a Woztell:', error);
    }
}
