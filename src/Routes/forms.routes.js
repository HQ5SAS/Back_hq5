import express from 'express';
import newRecord from '../Controllers/forms/newRecord.controller.js';
import createRecord from '../Controllers/forms/createRecord.controller.js';
import editRecord from '../Controllers/forms/editRecord.controller.js';
import { verifyTokenMiddleware } from '../Tools/utils.js';

const router = express.Router();

// Obtener los valores a cargar en los campos del formulario frontend web (Creacion de registro)
router.get('/', verifyTokenMiddleware, newRecord.processForm);

// Obtener los valores a cargar en los campos del formulario frontend web (Edicion registro)
router.get('/edit', verifyTokenMiddleware, editRecord.processForm);

// Crear registro de respuesta en Zoho, y luego ejecutar la sincronización de datos (Success form)
router.post('/', verifyTokenMiddleware, createRecord.processForm);

export default router;