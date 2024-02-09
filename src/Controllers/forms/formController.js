import { createErrorResponse, createCustomersResponse } from '../../Tools/utils.js';
import { FORM_GET_VAL } from '../../Tools/process.js';

async function logAndRespond(res, message, statusCode, process = null, data = null) {
    const response = createCustomersResponse(message, statusCode, process, data);
    res.status(statusCode).json(response);
    return response;
}

async function getFieldValue(req, res) {
    try {

        // Validar contenido de la solicitud
        const { customer, task } = req.body;
        if (!customer || !task) {
            return logAndRespond(res, 'Clave (customer) o (task) no encontrada en el cuerpo de la solicitud', 400);
        }

        // Lógica para obtener los valores del formulario - Pendiente
        // const requisicionValue = req.query.requisicion; 
        // query pendiente

        // Definir todas las opciones para las ordenes de ingreso
        const requisicionOptions = {
            postulados: [123, 1234, 12345, 123456],
            cliente: {
                id: "1",
                cliente: "abc",
                centros_costo: ["centro 1", "centro 2"],
                naturaleza_centro_costo: ["naturaleza 1", "naturaleza 2"],
                proyecto: ["proyecto 1", "proyecto 2"],
                linea: ["linea 1", "linea 2"],
                area: ["area 1", "area 2"],
                sub_centro_costo: ["sub centro 1", "sub centro 2"],
                dependencia: ["dependencia 1", "dependencia 2"],
                proceso: ["proceso 1", "proceso 2"],
            },
            cargo: {
                nivel_riesgo: ["1", "2", "3"]
            },
            salario: 123456789,
            sabado_habil: ["SI", "NO"],
            beneficios_contrato: {
                grupo: {
                    grupo1: {
                        concepto: ["concepto 1", "concepto 2"],
                    },
                    grupo2: {
                        concepto: ["concepto 1", "concepto 2"],
                    },
                    grupo3: {
                        concepto: ["concepto 1", "concepto 2"],
                    },
                    grupo4: {
                        concepto: ["concepto 1", "concepto 2"],
                    },
                },
                valor: null,
                metodologia_pago: ["metodologia 1", "metodologia 2"],
            },
            fecha_ingreso: null,
            sitio_trabajo: null,
            sitio_presentacion: null,
            observaciones: null,
        };

        // Crear el objeto de respuesta
        const valuesForm = {
            orden_de_ingreso: {
                requisicion: requisicionOptions,
                requisicion2: requisicionOptions,
                requisicion3: requisicionOptions,
            },
        };

        const message = 'Valores del formulario obtenidos correctamente';

        return logAndRespond(res, message, 200, FORM_GET_VAL, valuesForm);

    } catch (error) {
        console.error('Error al obtener los valores para el formulario web:', error);
        const errorResponse = createErrorResponse('Error interno del servidor', 500);
        return res.status(errorResponse.statusCode).json(errorResponse);
    }
}

const requestsController = { getFieldValue };
export default requestsController;