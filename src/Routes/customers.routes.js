import express from 'express';
import contactController from '../Controllers/customers/contact.controller.js';
import serviClientController from '../Controllers/customers/serviceClient.controller.js';
import taskController from '../Controllers/customers/task.controller.js';
import {validateToken} from '../Tools/woztell.js';

const router = express.Router();

// Validar contacto (Customers - Whatsapp)
router.post('/validateContact', validateToken, contactController.validateContact);

// Validar servicios que tiene el contacto de acuerdo al cliente (Customers - Whatsapp)
router.post('/consultServiceClient', validateToken, serviClientController.consultServiceClient);

// Servicio generar orden de ingreso (Customers - Whatsapp)
router.post('/task1', validateToken, taskController.responseRequest);

// Confirmar orden de ingreso (Servicio 1) (Customers - Whatsapp)
router.post('/confirmEntryOrder', validateToken, (req, res) => {
    console.log(req.body);
    res.status(200).send('Correcto');
});

// Contact soporte orden de ingreso (Servicio 1) (Customers - Whatsapp)
router.post('/supportEntryOrder', validateToken, (req, res) => {
    console.log(req.body);
    res.status(200).send('Correcto');
});

export default router;