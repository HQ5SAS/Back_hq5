import { createErrorResponse, logAndRespond } from '../../Tools/utils.js';
import { calculateBusinessDays, createDescendingDateMap, createAscendantDateObject, filterBusinessDaysObject } from '../../Lib/Task/payrollDateChange.function.js';
import { redirectWoztellByMemberId } from '../../Tools/woztell.js';
import { formatDate } from '../../Tools/date.js';
import { logWhatsAppCustomerMessages } from '../../Tools/zoho.js';
import { consultRecordWz } from '../../Lib/wz.function.js';
import { consultContactByCelAndCustomer } from '../../Lib/contact.function.js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

async function verifyPayroll(req, res, type) {
    try {
        const { member, payrollDate, customer } = req.body;
        
        console.log(`Verificacion ${type} pago fecha nomina`);
        console.log(payrollDate);
        console.log(customer);

        // Validar cuerpo de la solicitud
        if (!member || !payrollDate || !customer) {
            return logAndRespond(res, `Clave (member), (payrollDate) o (customer) no encontrada en el cuerpo de la solicitud`, 400);
        }

        // Realizar respuesta a la solicitud
        logAndRespond(res, `Solicitud procesada correctamente`, 200);

        // Consultar datos recibidos en la solicitud
        const { _id: memberId, externalId, app } = member;
        const wz_id = await consultRecordWz(memberId, externalId, app);

        // Crear objeto fechas y procesar los dias de diferencia entre ellos
        const currentDate = new Date();
        const [day, month, year] = payrollDate.split('/').map(Number);
        const payrollDatePay = new Date(year, month - 1, day);
        const businessDaysDifference = calculateBusinessDays(currentDate, payrollDatePay);
        const countDays = businessDaysDifference > 5 ? 5 : businessDaysDifference;
        const dateData = type === 'adelanto' ? createDescendingDateMap(payrollDatePay, countDays) : createAscendantDateObject(payrollDatePay, 5);

        // Redireccionar al cliente al nodo para informar que no es posible modificar el pago de nomina para adelantarlo
        if (type === 'adelanto' && businessDaysDifference < 5) {
            const response = await redirectWoztellByMemberId(process.env.WZ_NODE_NOT_ADV_PAY_PAYMENT, wz_id.memberId);
            console.log(response);
            return;
        }

        // Redireccionar al cliente al nodo correspondiente
        const node = type === 'adelanto' ? process.env.WZ_NODE_ADV_PAY_PAYMENT : process.env.WZ_NODE_DEL_PAY_PAYMENT;
        const dateDataObj = type === 'adelanto' ? dateData : dateData;      
        // const dateDataObj = type === 'adelanto' ? dateData : filterBusinessDaysObject(dateData);      
        const dateMap = Object.fromEntries([...dateDataObj.entries()]);
        const message = [...dateDataObj.entries()].map(([id, date], index) => `${index + 1}️⃣  ${date}`).join('\n');

        const response = await redirectWoztellByMemberId(node, wz_id.memberId, {
            [type === 'adelanto' ? 'dateAdvPay' : 'dateDelPay']: { ...dateMap },
            [type === 'adelanto' ? 'messageAdvPay' : 'messageDelPay']: message,
        });

        console.log(response);
        return;

    } catch (error) {
        console.error(`Error en verificar el ${type} del pago de nomina del cliente`, error);
        const errorResponse = createErrorResponse('Error interno del servidor', 500);
        res.status(errorResponse.statusCode).json(errorResponse);
    }
}

async function processPayrollChange(req, res, type) {
    try {
        const { member, payrollDateChange, customer } = req.body;

        console.log(`${type} pago fecha nomina`);
        console.log(payrollDateChange);
        console.log(customer);

        // Validar cuerpo de la solicitud
        if (!member || !payrollDateChange || !customer) {
            return logAndRespond(res, `Clave (member), (payrollDateChange) o (customer) no encontrada en el cuerpo de la solicitud`, 400);
        }

        // Realizar respuesta a la solicitud
        logAndRespond(res, `Solicitud procesada correctamente`, 200);

        // Consultar datos recibidos en la solicitud
        const { _id: memberId, externalId, app } = member;
        const wz_id = await consultRecordWz(memberId, externalId, app);
        const cel = parseInt(wz_id.externalId.substring(2));
        const { id: contactId } = await consultContactByCelAndCustomer(cel, customer);

        // Procesar la fecha recibida
        const [day, month, year] = payrollDateChange.split('/').map(Number);
        const payrollDate = new Date(year, month - 1, day);
        const getPayrollDateChange = formatDate(payrollDate);

        // Redireccionar al cliente al nodo donde confirma que se notifico acerca del cambio de la fecha
        const response = await redirectWoztellByMemberId(process.env.WZ_NODE_NOTIF_ADV_DEL_PAY_PAYMENT, wz_id.memberId);

        // Ticket a compensación para notificar el cambio de fecha al crear registro en el reporte de WhatsApp
        if (response) {
            const messageData = {
                contactId: contactId,
                request: `${type} pago nomina`,
                type: 'Entrada',
                description: `El cliente solicito ${type} el pago de nomina a través de WhatsApp para la fecha: ${getPayrollDateChange}`,
                whatsappMemberId: response.member,
                requestStatus: '1'
            };
            await logWhatsAppCustomerMessages(messageData);
        }

    } catch (error) {
        console.error(`Error en ${type} el pago de nomina del cliente`, error);
        const errorResponse = createErrorResponse('Error interno del servidor', 500);
        res.status(errorResponse.statusCode).json(errorResponse);
    }
}

// Uso de la función para verificar adelanto de pago
async function verifyPayrollPayment(req, res) {
    await verifyPayroll(req, res, 'adelanto');
}

// Uso de la función para verificar retraso de pago
async function verifyPayrollDelay(req, res) {
    await verifyPayroll(req, res, 'retraso');
}

// Funcion específica para adelantar el pago de nómina
async function advancePayrollPayment(req, res) {
    await processPayrollChange(req, res, 'Adelantar');
}

// Funcion específica para retrasar el pago de nómina
async function delayPayrollPayment(req, res) {
    await processPayrollChange(req, res, 'Retrasar');
}

// Controlador para adelanto de nomina solicitado a traves del bot de whatsapp
const requestsController = { verifyPayrollPayment, advancePayrollPayment, verifyPayrollDelay, delayPayrollPayment };
export default requestsController;
