import { getAccessToken } from '../../Tools/zoho.js';
import * as entryOrder from '../../Lib/EntryOrder/entryOrder.function.js';
import fetch from 'node-fetch';
import fs from 'fs/promises';

const BASE_URL_HQ5 = 'https://creator.zoho.com/api/v2.1/hq5colombia/hq5/report/';

const fetchData = async (apiUrl, criteria, accessToken) => {
    const url = `${apiUrl}?criteria=${criteria}`;
    try {
        const response = await fetch(url, { method: 'GET', headers: { 'Authorization': `Zoho-oauthtoken ${accessToken}` } });
        return response.ok ? await response.json() : null;
    } catch (error) {
        console.error('Error en la solicitud:', error.message);
        return null;
    }
};

const fetchData2 = async (apiUrl, criteria, accessToken) => {
    const url = `${apiUrl}?${criteria}`;
    try {
        const response = await fetch(url, { method: 'GET', headers: { 'Authorization': `Zoho-oauthtoken ${accessToken}` } });
        return response.ok ? await response.json() : null;
    } catch (error) {
        console.error('Error en la solicitud:', error.message);
        return null;
    }
};

const buildInnerApplyCallsObject = (applyCallsData) => {
    return applyCallsData.reduce((obj, { ID: id, DOCUMENTO: document, NOMBRES_Y_APELLIDOS: hv, Estado_postulacion1: status }) => {
        const { primer_nombre_HV: name, primer_apellido_HV: lastName } = hv;
        obj[document] = { id: id, documento: document, estado: status, nombre: `${name} ${lastName}` };
        return obj;
    }, {});
};

const buildInnerCenterCostObject = (centerCostData) => {
    return centerCostData.reduce((obj, { id, nombre, periodicidad, dias_pago }) => ({ ...obj, [nombre]: { id, nombre, periodicidad, dias_pago } }), {});
};

const buildInnerProfileObject = (profileData) => {
    return profileData.reduce((obj, { cargo: name, ID: id, riesgo: riskLevel }) => ({ ...obj, [name]: { id, riesgo: riskLevel } }), {});
};

const buildInnerNatureCenterCostObject = (NatureCCData) => {
    return NatureCCData.reduce((obj, { id, nombre }) => ({ ...obj, [nombre]: { id, nombre } }), {});
};

const buildInnerProyectCCObject = (proyectCCData) => {
    return proyectCCData.reduce((obj, { id, nombre }) => ({ ...obj, [nombre]: { id, nombre } }), {});
};

const buildInnerBusinessLineObject = (businessLineData) => {
    return businessLineData.reduce((obj, { id, nombre }) => ({ ...obj, [nombre]: { id, nombre } }), {});
};

const buildInnerAreaObject = (areaData) => {
    return areaData.reduce((obj, { id, nombre }) => ({ ...obj, [nombre]: { id, nombre } }), {});
};

const buildInnerSubCenterObject = (subCenterData) => {
    return subCenterData.reduce((obj, { id, nombre }) => ({ ...obj, [nombre]: { id, nombre } }), {});
};

const buildInnerGroupConceptObject = (groupConceptData) => {
    return groupConceptData.reduce((obj, { id, nombre }) => ({ ...obj, [nombre]: { id, nombre } }), {});
};

const buildInnerConceptObject = (conceptData) => {
    return conceptData.reduce((obj, { id, nombre }) => ({ ...obj, [nombre]: { id, valor: 0, metodologia_pago: ['Proporcional días laborados', 'Valor fijo mes'] } }), {});
};

const buildInnerReqObj = (element, applyCallsObj, profileObj) => {

    const { ID: id, Salario_basico: salary, ESTADO: status, tipo_cont_gen_req_lp_agreg_tip_jorn: typeContract, Tipo_de_Jornada: typeWorkDay } = element;

    const dataContract = { nombre: typeContract.Nombre, id: typeContract.ID };
    const dataWorkDay = { nombre: typeWorkDay.Nombre, id: typeWorkDay.ID };
    const salaryBasic = { min: 10, valor: salary, max: 10000000 };

    return {
        estado: status,
        id: id,
        postulados: applyCallsObj,
        nivel_riesgo: profileObj,
        salario_basico: salaryBasic,
        tipo_contrato: dataContract,
        tipo_jornada: dataWorkDay,     
    };
};

const buildInnerDataObj = (centerCostObj, natureCCObj, proyectCCObj, businessLineObj, areaObj, subCenterObj, GroupObj, groupConceptObj) => {
    return {
        centro_costo: centerCostObj,
        fecha_ingreso: null,
        sitio_trabajo: null,
        sitio_presentacion: null,
        salario_integral: ["SI", "NO"],
        sabado_habil: ["SI", "NO"],
        observaciones: null,
        beneficios_contrato: { grupo: GroupObj, concepto: groupConceptObj },
        naturaleza_cc: natureCCObj,
        proyecto_cc: proyectCCObj,
        linea_negocio_cc: businessLineObj,
        area_cc: areaObj,
        sub_centro_cc: subCenterObj
    };
};

const processRequisitionData = async (responseData, accessToken) => {
    const reqObj = {};

    // Obtener una matriz de promesas para todas las solicitudes en paralelo
    const promises = responseData.map(async (element) => {
        const { id_req_gen_req: reqNumber, ID: reqId, cargo_gen_req_lp_perf: profile } = element;
        const { ID: profileId } = profile;

        // faltaria validacion de orden ingreso
        const responseApplyCallsPromise = fetchData(`${BASE_URL_HQ5}vista_general`, `REQUISICION_RELATED.ID=${reqId}`, accessToken);
        const responseProfilePromise = fetchData(`${BASE_URL_HQ5}Perfiles_Report`, `ID=${profileId}`, accessToken);

        const [ responseApplyCalls, 
                responseProfile
            ] = await Promise.all([
            responseApplyCallsPromise, 
            responseProfilePromise
        ]);

        const applyCallsObj = responseApplyCalls && Array.isArray(responseApplyCalls.data) ?
            buildInnerApplyCallsObject(responseApplyCalls.data) : {};

        const profileObj = responseProfile?.data && Array.isArray(responseProfile.data) ?
            buildInnerProfileObject(responseProfile.data) : {};

        const innerObj = buildInnerReqObj(element, applyCallsObj, profileObj);
        reqObj[reqNumber] = innerObj;
    });

    // Esperar a que todas las solicitudes en paralelo se completen antes de retornar
    await Promise.all(promises);

    return reqObj;
};

const processDataFields = async (element) => {
    const { cliente_gen_req: customer } = element;
    const { ID: customerId } = customer;

    const [ responseCostCenter, 
            responseNatureCC, 
            responseProyectoCC, 
            responseBusinessLine, 
            responseArea, 
            responseSubCenter, 
            responseGroup 
        ] = await Promise.all([
        entryOrder.consultCostCenter(customerId),
        entryOrder.consultNature(customerId),
        entryOrder.consultProject(customerId),
        entryOrder.consultBusinessLine(customerId),
        entryOrder.consultArea(customerId),
        entryOrder.consultSubCenterCost(customerId),
        entryOrder.consultGroup()
    ]);

    const centerCostObj = responseCostCenter && responseCostCenter.length > 0 ? buildInnerCenterCostObject(responseCostCenter) : {};
    const natureCCObj = responseNatureCC && responseNatureCC.length > 0 ? buildInnerNatureCenterCostObject(responseNatureCC) : {};
    const proyectCCObj = responseProyectoCC && responseProyectoCC.length > 0 ? buildInnerProyectCCObject(responseProyectoCC) : {};
    const businessLineObj = responseBusinessLine && responseBusinessLine.length > 0 ? buildInnerBusinessLineObject(responseBusinessLine) : {};
    const areaObj = responseArea && responseArea.length > 0 ? buildInnerAreaObject(responseArea) : {};
    const subCenterObj = responseSubCenter && responseSubCenter.length > 0 ? buildInnerSubCenterObject(responseSubCenter) : {};
    const GroupObj = responseGroup && responseGroup.length > 0 ? buildInnerGroupConceptObject(responseGroup) : {};

    let groupConceptObj = {};
    if (GroupObj) {
        await Promise.all(Object.entries(GroupObj).map(async ([key, value]) => {
            const responseConcept = await entryOrder.consultConcept(value.id);
            const ConceptObj = responseConcept && responseConcept.length > 0 ? buildInnerConceptObject(responseConcept) : {};
            groupConceptObj[value.nombre] = ConceptObj;
        }));
    }

    const dataObj = buildInnerDataObj(centerCostObj, natureCCObj, proyectCCObj, businessLineObj, areaObj, subCenterObj, GroupObj, groupConceptObj);
    return dataObj;
};

export const getFieldValue = async (customerId) => {
    try {
        const accessToken = await getAccessToken();

        if (!accessToken) {
            console.log('No se pudo obtener el Access Token');
            return null;
        }

        const response = await fetchData2(`${BASE_URL_HQ5}Todas_las_Requisiciones`, `cliente_gen_req.ID=${customerId}&ESTADO=ACEPTADA`, accessToken);

        if (response && response?.data && Array.isArray(response.data) && response.data.length > 0) {
            
            console.log("Procesando...");
            const [dataObj, reqObj] = await Promise.all([
                processDataFields(response.data[0], accessToken),
                //processRequisitionData(response.data, accessToken)
            ]);
            
            const reqObjF = { requisicion: reqObj};
            const combinedObj = Object.assign({}, dataObj, reqObjF);
            const entOrdObj = { orden_ingreso: { campos: combinedObj } };

            // Estas 4 lineas sobran con el procesando de arriba
            // const jsonString = JSON.stringify(entOrdObj, null, 2);
            // const filePath = './archivo.json';
            // await fs.writeFile(filePath, jsonString, 'utf-8');
            console.log("Completado");

            return entOrdObj;

        } else {
            console.error('Reporte requisiones vacio');
            return null;
        }

    } catch (error) {
        console.error('Error al obtener los valores del campo del formulario:', error.message);
        return null;
    }
};