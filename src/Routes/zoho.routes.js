import express from 'express';
import entryOrder from '../Controllers/zoho/entryOrder.controller.js';

const router = express.Router();

// Notificar por WhatsApp cuando se crea una orden de ingreso
router.post('/createEntryOrder', entryOrder.notifyCreateEntryOrderCustomer);

// Notificar por WhatsApp cuando se modifica una orden de ingreso
router.post('/modifyEntryOrder', entryOrder.notifyModifyEntryOrderCustomer);

// Notificar por WhatsApp cuando se crea una orden de ingreso por parte de la empresa (Solo ver la informacion de la orden de ingreso)
router.post('/reviewEntryOrder', entryOrder.notifyReviewEntryOrderCustomer);

export default router;