import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

// Clase para conexión con base de datos usando mysql2
class DatabaseConnection {
    constructor() {
        this.connection = mysql.createPool({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_DATABASE,
            port: process.env.DB_PORT,
            connectionLimit: 100,
            connectTimeout: 20000,
        });

        console.log('Conexión a la base de datos establecida');
    }

    async query(sql, values) {
        try {
            const [results, fields] = await this.connection.query(sql, values);
            return { results, fields };
        } catch (err) {
            console.error('Error al realizar la consulta:', err);
            throw err;
        }
    }

    async end() {
        try {
            await this.connection.end();
            console.log('Conexión cerrada');
        } catch (err) {
            console.error('Error al cerrar la conexión:', err);
            throw err;
        }
    }
}

export const dbConnection = new DatabaseConnection();
