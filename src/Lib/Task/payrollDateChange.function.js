import { costCenterRecordExistsByIdCustomer } from '../../Database/costCenter.query.js';
import { formatDate } from '../../Tools/date.js';
import { isHoliday } from '../../Tools/holidays.js';

// Funcion para calcular la proxima fecha de pago, parametros (dias de pago, periodicidad)
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
        const daysToAdd = (currentDate.getDate() <= pay1) ? pay1 - currentDate.getDate() :
                        (pay2 && currentDate.getDate() <= pay2) ? pay2 - currentDate.getDate() :
                        pay1 - currentDate.getDate() + daysToMonth;
        futurePaymentDate = new Date(currentDate);
        futurePaymentDate.setDate(currentDate.getDate() + daysToAdd);
    }

    // Verificar si la fecha es sábado o domingo
    const dayOfWeek = futurePaymentDate.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
        futurePaymentDate.setDate(futurePaymentDate.getDate() - (dayOfWeek === 0 ? 2 : 1));
    }

    console.log(`Fecha actual: ${formatDate(currentDate)}`);
    console.log(`Fecha pago futura: ${formatDate(futurePaymentDate)}`);

    return futurePaymentDate;
}

// Funcion para obtener los centros de costo por id cliente y obtener la proxima fecha de pago
export const processPayrollDate = async (customerId) => {
    const response = await costCenterRecordExistsByIdCustomer(customerId);
    const [ firstResult ] = response;
    const { id: recordId, dias_pago: payDays, periodicidad: periodicity, nombre: nameCenterCost } = firstResult || {};
    const datePay = await getNextPaymentDate(payDays, periodicity);
    
    console.log(payDays, periodicity, recordId);
    
    return `${formatDate(datePay)}`
};

// Funcion para calcular los dias habiles entre dos fechas como parametro (habiles: Lunes a Viernes)
export const calculateBusinessDays = (startDate, endDate) => {
    const weekdays = [1, 2, 3, 4, 5];
    
    // Ajustar las fechas al inicio y fin del día
    const startDateCopy = new Date(startDate);
    startDateCopy.setHours(0, 0, 0, 0);

    const endDateCopy = new Date(endDate);
    endDateCopy.setUTCHours(23, 59, 59, 999);
    
    // Ajustar la fecha de inicio y fin
    startDateCopy.setDate(startDateCopy.getDate() + 1);
    endDateCopy.setDate(endDateCopy.getDate() - 1);

    let businessDays = 0;
    
    while (startDateCopy <= endDateCopy) {
        if (weekdays.includes(startDateCopy.getDay()) && !isHoliday(startDateCopy.getFullYear(), startDateCopy.getMonth() + 1, startDateCopy.getDate())) {
            businessDays += 1;
        }
        startDateCopy.setDate(startDateCopy.getDate() + 1);
    }

    return businessDays;
}

// Función para filtrar los días hábiles en un objeto de fechas ascendentes
export const filterBusinessDaysObject = (dateObject) => {
    const weekdays = [1, 2, 3, 4, 5];

    const filteredDates = [...dateObject].filter(([key, value]) => {
        const [day, month, year] = value.split('/').map(Number);
        const date = new Date(year, month - 1, day);
        return weekdays.includes(date.getDay());
    });

    return new Map(Array.from(filteredDates).map(([key, value], index) => [String(index + 1), value]));
};

// Funcion para generar un mapa con las fechas de pago que es posible adelantar
export const createDescendingDateMap = (startDate, days) => {
    const weekdays = [1, 2, 3, 4, 5];
    const descendingDates = [];
    let currentDate = new Date(startDate);
    currentDate.setDate(currentDate.getDate() + 1);
    
    for (let i = 0; i < days; i++) {
        currentDate.setDate(currentDate.getDate() - 1);
        while (!weekdays.includes(currentDate.getDay()) || isHoliday(currentDate.getFullYear(), currentDate.getMonth() + 1, currentDate.getDate())) {
            currentDate.setDate(currentDate.getDate() - 1);
        }
        descendingDates.push(formatDate(currentDate));
    }

    const descendingDateMap = new Map(descendingDates.map((date, index) => [String(index + 1), date]));
    return descendingDateMap;

    // return new Map([...Array(days)].map((_, i) => [String(i + 1), formatDate(new Date(startDate - i * 24 * 60 * 60 * 1000))]));
}

// Funcion para generar un mapa con las fechas de pago que es posible retrasar
export const createAscendantDateObject = (startDate, days) => {
    const weekdays = [1, 2, 3, 4, 5];
    const ascendantDates = [];
    let currentDate = new Date(startDate);
    
    for (let i = 0; i < days; i++) {
        currentDate.setDate(currentDate.getDate() + 1);
        while (!weekdays.includes(currentDate.getDay()) || isHoliday(currentDate.getFullYear(), currentDate.getMonth() + 1, currentDate.getDate())) {
            currentDate.setDate(currentDate.getDate() + 1);
        }
        ascendantDates.push(formatDate(currentDate));
    }

    const ascendantDateMap = new Map(ascendantDates.map((date, index) => [String(index + 1), date]));
    return ascendantDateMap;
    
    // return new Map([...Array(days)].map((_, i) => [String(i + 1), formatDate(new Date(startDate.getTime() + ((i + 1) * 24 * 60 * 60 * 1000)))]));
}