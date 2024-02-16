import express from 'express';
import formGet from '../Controllers/forms/formGet.controller.js';
import formPost from '../Controllers/forms/formPost.controller.js';
import { verifyTokenMiddleware } from '../Tools/utils.js';

const router = express.Router();

// Obtener los valores a cargar en los campos del formulario frontend web
// Falta agregar la validacion de token
router.get('/', formGet.processForm);

// Falta validar token y crear registro de respuesta en Zoho, y luego lo aparte del ciclo
router.post('/', formPost.processForm);

export default router;