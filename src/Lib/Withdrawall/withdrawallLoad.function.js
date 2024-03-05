import { consultEmployeeByCustomerAndState } from '../employee.function.js';
import { formatDate } from '../../Tools/date.js';

// Funcion para generar objeto de empleado
const buildInnerEmployeeObject = (data) => {
    return data.reduce((obj, { id, documento, fecha_ingreso, nombre, apellido }) => {
        const fullName = `${nombre} ${apellido}`;
        const dateWithdrawall = formatDate(fecha_ingreso);
        obj[documento] = { id, nombre: fullName, fecha_ingreso: dateWithdrawall };
        return obj;
    }, {});
};

// Funcion para procesar las consultas globales de los campos
const processDataFields = async (data) => {
    const empObj = buildInnerEmployeeObject(data);
    return {
        empleados: empObj,
        fecha_retiro: null,
        motiro_retiro: null,
        paz_salvo: ["SI", "NO"],
        fecha_notificacion: null,
    }
};

// Funcion para obtener los campos de las marcaciones de retiro en el proceso de creacion
export const getFieldValueCreate = async (customerId, contactId, stateEmp) => {
    try {
        const responseEmp = await consultEmployeeByCustomerAndState(customerId, stateEmp);

        if (responseEmp && responseEmp.length > 0) {

            const dataObj = await processDataFields(responseEmp);

            const contObj = { contacto: contactId};
            const combinedObj = Object.assign({}, contObj, dataObj);
            const withdrawallObj = { marcacion_retiro: { campos: combinedObj } };
            
            return withdrawallObj;

        } else {
            console.error('Tabla empleado vacia');
            return {};
        }

    } catch (error) {
        console.error('Error al obtener los valores del formulario: getFieldValueCreate', error.message);
        return null;
    }
};
