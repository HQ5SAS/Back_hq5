import express from 'express';
import loadRecord from '../Controllers/forms/loadRecord.controller.js';
import successRecord from '../Controllers/forms/successRecord.controller.js';
import { verifyTokenMiddleware } from '../Tools/utils.js';

const router = express.Router();

// Obtener los valores a cargar en los campos del formulario frontend web (Creacion y edicion de registro)
router.get('/', verifyTokenMiddleware, loadRecord.processForm);

// Crear registro de respuesta del frontend en Zoho, y luego ejecutar la sincronización de datos (Success form)
router.post('/', verifyTokenMiddleware, successRecord.processForm);

export default router;