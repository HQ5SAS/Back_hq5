import express from 'express';
import formGet from '../Controllers/forms/formGet.controller.js';
import formPost from '../Controllers/forms/formPost.controller.js';
import { verifyTokenMiddleware } from '../Tools/utils.js';

const router = express.Router();

// Falta agregar la validacion de token

// Obtener los valores a cargar en los campos del formulario frontend web
router.get('/', formGet.processForm);

// Crear registro de respuesta en Zoho, y luego lo aparte del ciclo de sync
router.post('/', formPost.processForm);

export default router;