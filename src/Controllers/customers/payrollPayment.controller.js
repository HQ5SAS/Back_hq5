import { createErrorResponse, logAndRespond } from '../../Tools/utils.js';
import { calculateBusinessDays, createDescendingDateMap, createAscendantDateObject, filterBusinessDaysObject } from '../../Lib/Task/payrollDateChange.function.js';
import { redirectWoztellByMemberId } from '../../Tools/woztell.js';
import { formatDate } from '../../Tools/date.js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

// Funcion para verificar el adelanto del pago de nomina solicitado a traves del bot de whatsapp
async function verifyPayrollPayment(req, res) {
    try {
        const { member, payrollDate, customer } = req.body;
        
        console.log("Verificacion pago fecha nomina");
        console.log(payrollDate);
        console.log(customer);

        // Verificar la existencia de 'member', 'payrollDate', 'customer'
        if (!member || !payrollDate || !customer) {
            return logAndRespond(res, 'Clave (member), (payrollDate) o (customer) no encontrada en el cuerpo de la solicitud', 400);
        }

        // Realizar respuesta a la solicitud
        logAndRespond(res, `Solicitud procesada correctamente`, 200);

        // Crear objeto fechas y procesar los dias de diferencia entre ellos
        const currentDate = new Date();
        const [day, month, year] = payrollDate.split('/').map(Number);
        const payrollDatePay = new Date(year, month - 1, day);
        const businessDaysDifference = calculateBusinessDays(currentDate, payrollDatePay);

        // Redireccionar al cliente al nodo para informar que no es posible modificar el pago de nomina
        if(businessDaysDifference < 5){
            const response = await redirectWoztellByMemberId(process.env.WZ_NODE_NOT_ADV_PAY_PAYMENT, '65c3fb10c8d09d00086daef3');
            console.log(response);
            return;
        }

        // Procesar la data
        const dateData = createDescendingDateMap(payrollDatePay, 5);
        const dateMap = Object.fromEntries([...dateData.entries()]);
        const message = [...dateData.entries()].map(([id, date], index) => `${index + 1}️⃣  ${date}`).join('\n');
        
        // Redireccionar al cliente al nodo para informar las posibles fechas de adelanto de pago
        const response = await redirectWoztellByMemberId(process.env.WZ_NODE_ADV_PAY_PAYMENT, '65c3fb10c8d09d00086daef3', {
            dateAdvPay: { ...dateMap },
            messageAdvPay: message,
        });
        console.log(response);
        return;

    } catch (error) {
        console.error('Error en verificar el pago de nomina del cliente', error);
        const errorResponse = createErrorResponse('Error interno del servidor', 500);
        res.status(errorResponse.statusCode).json(errorResponse);
    }
}

// Funcion para adelantar el pago de nomina solicitado a traves del bot de whatsapp
async function advancePayrollPayment(req, res) {
    try {
        const { member, payrollDateChange, customer } = req.body;

        console.log("Adelanto pago fecha nomina");
        console.log(payrollDateChange);
        console.log(customer);

        // Verificar la existencia de 'member', 'payrollDateChange' y 'customer'
        if (!member || !payrollDateChange || !customer) {
            return logAndRespond(res, 'Clave (member), (payrollDateChange) o (customer) no encontrada en el cuerpo de la solicitud', 400);
        }

        // Realizar respuesta a la solicitud
        logAndRespond(res, `Solicitud procesada correctamente`, 200);

        // Procesar la fecha recibida
        const [day, month, year] = payrollDateChange.split('/').map(Number);
        const payrollDate = new Date(year, month - 1, day);
        const getPayrollDateChange = formatDate(payrollDate);

        // Ticket a compensacion para notificar el adelanto de pago de nomina del cliente al crear registro en el reporte de whatsapp
        
        // Redireccionar al cliente al nodo donde confirma que se notifico acerca del cambio de la fecha
        const response = await redirectWoztellByMemberId(process.env.WZ_NODE_NOTIF_ADV_PAY_PAYMENT, '65c3fb10c8d09d00086daef3');
        console.log(response);
        return;

    } catch (error) {
        console.error('Error en adelantar el pago de nomina del cliente', error);
        const errorResponse = createErrorResponse('Error interno del servidor', 500);
        res.status(errorResponse.statusCode).json(errorResponse);
    }
}

// Funcion para verificar el retraso del pago de nomina solicitado a traves del bot de whatsapp
async function verifyPayrollDelay(req, res) {
    try {
        const { member, payrollDate, customer } = req.body;
        
        console.log("Verificacion retraso pago fecha nomina");
        console.log(payrollDate);
        console.log(customer);

        // Verificar la existencia de 'member', 'payrollDate', 'customer'
        if (!member || !payrollDate || !customer) {
            return logAndRespond(res, 'Clave (member), (payrollDate) o (customer) no encontrada en el cuerpo de la solicitud', 400);
        }

        // Realizar respuesta a la solicitud
        logAndRespond(res, `Solicitud procesada correctamente`, 200);

        // Crear objeto fechas
        const [day, month, year] = payrollDate.split('/').map(Number);
        const payrollDatePay = new Date(year, month - 1, day);

        // Procesar la data
        const dateDataObj = createAscendantDateObject(payrollDatePay, 5);
        const dateData = filterBusinessDaysObject(dateDataObj);
        const dateMap = Object.fromEntries([...dateData.entries()]);
        const message = [...dateData.entries()].map(([id, date], index) => `${index + 1}️⃣  ${date}`).join('\n');
        
        // Redireccionar al cliente al nodo para informar las posibles fechas de retraso de pago
        const response = await redirectWoztellByMemberId(process.env.WZ_NODE_DEL_PAY_PAYMENT, '65c3fb10c8d09d00086daef3', {
            dateDelPay: { ...dateMap },
            messageDelPay: message,
        });

        console.log(response);
        return;

    } catch (error) {
        console.error('Error en verificar el retraso del pago de nomina del cliente', error);
        const errorResponse = createErrorResponse('Error interno del servidor', 500);
        res.status(errorResponse.statusCode).json(errorResponse);
    }
}

// Funcion para retrasar el pago de nomina solicitado a traves del bot de whatsapp
async function delayPayrollPayment(req, res) {
    try {
        const { member, payrollDateChange, customer } = req.body;

        console.log("Retraso pago fecha nomina");
        console.log(payrollDateChange);
        console.log(customer);

        // Verificar la existencia de 'member', 'payrollDateChange' y 'customer'
        if (!member || !payrollDateChange || !customer) {
            return logAndRespond(res, 'Clave (member), (payrollDateChange) o (customer) no encontrada en el cuerpo de la solicitud', 400);
        }

        // Realizar respuesta a la solicitud
        logAndRespond(res, `Solicitud procesada correctamente`, 200);

        // Procesar la fecha recibida
        const [day, month, year] = payrollDateChange.split('/').map(Number);
        const payrollDate = new Date(year, month - 1, day);
        const getPayrollDateChange = formatDate(payrollDate);

        // Ticket a compensacion para notificar el retraso de pago de nomina del cliente al crear registro en el reporte de whatsapp
        
        // Redireccionar al cliente al nodo donde confirma que se notifico acerca del cambio de la fecha
        const response = await redirectWoztellByMemberId(process.env.WZ_NODE_NOTIF_ADV_PAY_PAYMENT, '65c3fb10c8d09d00086daef3');
        console.log(response);
        return;

    } catch (error) {
        console.error('Error en retrasar el pago de nomina del cliente', error);
        const errorResponse = createErrorResponse('Error interno del servidor', 500);
        res.status(errorResponse.statusCode).json(errorResponse);
    }
}

// Controlador para adelanto de nomina solicitado a traves del bot de whatsapp
const requestsController = { verifyPayrollPayment, advancePayrollPayment, verifyPayrollDelay, delayPayrollPayment };
export default requestsController;