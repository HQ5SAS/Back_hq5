import express from 'express';
import morgan from 'morgan';
import dotenv from 'dotenv';
import corsConfig from './corsConfig.js';
import { fileURLToPath, pathToFileURL } from 'url';
import { dirname, join } from 'path';
import { readdir } from 'fs/promises';
import { dbConnection } from '../Database/connection.js';
import { log } from 'console';

dotenv.config({ path: '.env' });

const app = express();
const PORT = process.env.PORT || 4001;
const router = express.Router();

app.set('port', PORT);
app.use(express.json());
app.use(morgan('dev'));
app.use(corsConfig);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const routesDir = join(__dirname, '../Routes');

const importRoutes = async () => {
    try {
        const routeFiles = (await readdir(routesDir)).filter(file => file.endsWith('.routes.js'));

        await Promise.all(routeFiles.map(async file => {
            const filePath = join(routesDir, file);
            const fileUrl = pathToFileURL(filePath).href;
            const { default: routes } = await import(fileUrl);
            const routeName = file.replace('.routes.js', '').toLowerCase();
            router.use(`/api/v1/${routeName}`, routes);
            // console.log(`Ruta > ${routeName}`);
        }));

    } catch (error) {
        console.error('Error importing routes:', error);
    }
};

importRoutes();

app.use(router);

export default app;