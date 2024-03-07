import { costCenterRecordExistsByIdCustomer } from '../../Database/costCenter.query.js';
import { formatDate } from '../../Tools/date.js';

const getNextPaymentDate = async (payDays, periodicity) => {
    const currentDate = new Date();

    let [pay1, pay2] = (payDays || '').includes('-') ? payDays.split('-').map(pay => parseInt(pay.trim(), 10)) : [parseInt(payDays.trim(), 10)];

    if (currentDate.getMonth() + 1 === 2 && pay2 === 30 || pay2 === 29) {
        pay2 = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    }

    let futurePaymentDate;

    // Procesamiento de las fechas de pago Mensual
    if (periodicity === "MENSUAL") {
        const daysToMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
        const daysToAdd = daysToMonth < pay1 ? daysToMonth - currentDate.getDate() : pay1 - currentDate.getDate();
        futurePaymentDate = new Date(currentDate);
        futurePaymentDate.setDate(currentDate.getDate() + daysToAdd);
        if (currentDate.getDate() > pay1) {
            futurePaymentDate.setMonth(currentDate.getMonth() + 1);
        }

    // Procesamiento de las fechas de pago Quincenal
    } else if (periodicity === "QUINCENAL") {
        const daysToMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
        const daysToAdd = (currentDate.getDate() < pay1) ? pay1 - currentDate.getDate() :
                        (pay2 && currentDate.getDate() < pay2) ? pay2 - currentDate.getDate() :
                        pay1 - currentDate.getDate() + daysToMonth;
        futurePaymentDate = new Date(currentDate);
        futurePaymentDate.setDate(currentDate.getDate() + daysToAdd);
    }

    console.log(`Fecha actual: ${formatDate(currentDate)}`);
    console.log(`Fecha pago futura: ${formatDate(futurePaymentDate)}`);

    return futurePaymentDate;
}

export const processPayrollDateChange = async (customerId) => {
    const response = await costCenterRecordExistsByIdCustomer(customerId);
    const [ firstResult ] = response;
    const { id: recordId, dias_pago: payDays, periodicidad: periodicity, nombre: nameCenterCost } = firstResult || {};
    const datePay = await getNextPaymentDate(payDays, periodicity);
    
    console.log(payDays, periodicity, recordId);
    
    return `${formatDate(datePay)}`
};