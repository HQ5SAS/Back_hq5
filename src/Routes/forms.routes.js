import express from 'express';
import formController from '../Controllers/forms/formController.js';
import {validateToken} from '../Tools/woztell.js';

const router = express.Router();

// Obtener los valores a cargar en los campos del formulario frontend web
router.get('/', validateToken, formController.getFieldValue);

export default router;