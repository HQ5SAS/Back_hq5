import express from 'express';
import contactController from '../Controllers/customers/contactController.js';
import serviClientController from '../Controllers/customers/serviceClientController.js';
import taskController from '../Controllers/customers/taskController.js';
import {validateToken} from '../Tools/woztell.js';

const router = express.Router();

// Validar contacto (Customers - Whatsapp)
router.post('/validateContact', validateToken, contactController.validateContact);

// Validar servicios que tiene el contacto de acuerdo al cliente (Customers - Whatsapp)
router.post('/consultServiceClient', validateToken, serviClientController.consultServiceClient);

// Servicio generar orden de ingreso (Customers - Whatsapp)
router.post('/task1', validateToken, taskController.responseRequest);

export default router;