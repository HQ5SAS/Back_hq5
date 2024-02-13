import express from 'express';
import formController from '../Controllers/forms/formController.js';
import { verifyTokenMiddleware } from '../Tools/utils.js';

const router = express.Router();

// Obtener los valores a cargar en los campos del formulario frontend web
router.get('/', formController.processForm);

export default router;