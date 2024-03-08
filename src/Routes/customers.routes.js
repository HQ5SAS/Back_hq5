import express from 'express';
import contactController from '../Controllers/customers/contact.controller.js';
import serviClientController from '../Controllers/customers/serviceClient.controller.js';
import taskController from '../Controllers/customers/task.controller.js';
import entryOrderController from '../Controllers/customers/entryOrder.controller.js';
import payrollPaymentController from '../Controllers/customers/payrollPayment.controller.js';
import { validateToken } from '../Tools/woztell.js';

const router = express.Router();

// Validar contacto (Customers - Whatsapp)
router.post('/validateContact', validateToken, contactController.validateContact);

// Validar servicios que tiene el contacto de acuerdo al cliente (Customers - Whatsapp)
router.post('/consultServiceClient', validateToken, serviClientController.consultServiceClient);

// Servicio del area de experiencia (Customers - Whatsapp)
router.post('/task', validateToken, taskController.responseRequest);

// Confirmar orden de ingreso (Generacion y aprobacion orden ingreso) (Customers - Whatsapp)
router.post('/confirmEntryOrder', validateToken, entryOrderController.confirmEntryOrderCustomer);

// Contact soporte orden de ingreso (Generacion y aprobacion orden ingreso) (Customers - Whatsapp)
router.post('/supportEntryOrder', validateToken, entryOrderController.supportEntryOrderCustomer);

// Verificar el adelanto del pago de nomina (Cambio fecha pago nomina) (Customers - Whatsapp)
router.post('/verifyPayrollPayment', validateToken, payrollPaymentController.verifyPayrollPayment);

// Adelantar el pago de nomina (Cambio fecha pago nomina) (Customers - Whatsapp)
router.post('/advancePayrollPayment', validateToken, payrollPaymentController.advancePayrollPayment);

// Verificar el retraso del pago de nomina (Cambio fecha pago nomina) (Customers - Whatsapp)
router.post('/verifyPayrollDelay', validateToken, payrollPaymentController.verifyPayrollDelay);

export default router;