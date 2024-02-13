import { getAccessToken } from '../../Tools/zoho.js';
import fetch from 'node-fetch';
import querystring from 'querystring';

// Lógica para obtener los valores de los campos del formulario (Orden ingreso)
export const getFieldValue = async (customer) => {
    try {
        const accessToken = await getAccessToken();

        if (!accessToken) {
            console.log('No se pudo obtener el Access Token');
            return;
        }

        // Generar requisicion
        const apiUrl = 'https://creator.zoho.com/api/v2.1/hq5colombia/hq5/report/Todas_las_Requisiciones';
        const clientId = '3960020000000245031';
        const estado = 'ACEPTADA';
        const url = `${apiUrl}?cliente_gen_req.ID=${clientId}&ESTADO=${estado}`;

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Zoho-oauthtoken ${accessToken}`
            },
        });

        if (response.ok) {
            const responseData = await response.json();

            if (responseData && responseData.hasOwnProperty('data') && Array.isArray(responseData.data)) {
                
                const reqObj = {};
                const lista = responseData.data;
                lista.forEach((element) => {reqObj[element.id_req_gen_req] = element.ID;});
                console.log(reqObj);

            } else {
                console.log('La clave "data" no está presente o no es una lista.');
            }

        } else {
            console.error('Error en la solicitud:', response.statusText);
        }

    } catch (error) {
        console.error('Error al obtener los valores del campo del formulario:', error.message);
    }
};


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
        nivel_riesgo: "1"
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