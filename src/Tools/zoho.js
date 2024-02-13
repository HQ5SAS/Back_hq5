import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

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