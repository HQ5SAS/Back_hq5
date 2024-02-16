import mysql from 'mysql';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

class DatabaseConnection {

    constructor() {
        this.connection = mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
        port: process.env.DB_PORT,
        connectTimeout: 20000,
        });

        this.connection.connect((err) => {
            if (err) {
            console.error('Error al conectar a la base de datos:', err);
            throw err;
            }
            console.log('Conectado a la base de datos');
        });
    }

    query(sql, values, callback) {
        this.connection.query(sql, values, (err, results, fields) => {
        if (err) {
            console.error('Error al realizar la consulta:', err);
            return;
        }
        callback(results, fields);
        });
    }

    end() {
        this.connection.end((err) => {
        if (err) {
            console.error('Error al cerrar la conexión:', err);
            throw err;
        }
        console.log('Conexión cerrada');
        });
    }
}

export const dbConnection = new DatabaseConnection();