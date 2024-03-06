import cron from 'node-cron';
import { consultEmployeeByCustomerAndState } from '../Lib/employee.function.js';
import { EMP_STATE_ACT } from '../Database/fields.js';
import { calculateDaysInfo, formatEmployeeForWhatsApp, generateEmployeeTablePDF } from '../Lib/Schedules/withdrawall.js';
import { redirectWoztellByRecipientId } from '../Tools/woztell.js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

export const notificationWithdrawall = async () => {
    try {
        const currentDate = new Date();
        const empRecord = await consultEmployeeByCustomerAndState('3960020000000245031', EMP_STATE_ACT);

        const employeesWithin60Days = empRecord
            .map(employee => calculateDaysInfo(employee, currentDate))
            .filter(employee => employee.daysDifference >= 305 && employee.daysDifference <= 365);

        // Determinar qué acción seguir según la cantidad de empleados
        if (employeesWithin60Days.length < 3) {
            const formattedEmployees = employeesWithin60Days.map(formatEmployeeForWhatsApp);
            const resultString = formattedEmployees.join('\n');
            console.log(resultString);

            const response = await redirectWoztellByRecipientId(process.env.WZ_NODE_WITHDRAWALL, '573115095276', { nameContact: "Master", infoWithdrawall: resultString });
            console.log(response);

        } else {
            const pdfPath = './src/Documents/employeeTable.pdf';
            generateEmployeeTablePDF(employeesWithin60Days, pdfPath);

        }

    } catch (error) {
        console.error('Error en la notificación de retiro', error);
    }
};

cron.schedule('0 8 * * 1-5', notificationWithdrawall);

/*
Minuto (0-59): El primer asterisco representa los minutos.
Hora (0-23): El segundo asterisco representa las horas.
Día del mes (1-31): El tercer asterisco representa los días del mes.
Mes (1-12 o nombres de los meses): El cuarto asterisco representa los meses.
Día de la semana (0-7 o nombres de los días de la semana): El quinto asterisco representa los días de la semana.
*/