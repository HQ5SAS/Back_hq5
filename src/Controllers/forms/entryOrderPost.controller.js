import { getAccessToken } from '../../Tools/zoho.js';
import * as entryOrder from '../../Lib/EntryOrder/entryOrder.function.js';
import fetch from 'node-fetch';
import fs from 'fs/promises';

const BASE_URL_HQ5 = 'https://creator.zoho.com/api/v2.1/hq5colombia/hq5/report/';
const BASE_URL_COM = 'https://creator.zoho.com/api/v2.1/hq5colombia/compensacionhq5/report/';

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
    const applyCallsObj = {};
    applyCallsData.forEach((element) => {
        const { ID: id, DOCUMENTO: document, NOMBRES_Y_APELLIDOS: hv, Estado_postulacion1: status } = element;
        const { primer_nombre_HV: name, primer_apellido_HV: lastName, ID: idHv } = hv;
        const nameComplete = `${name} ${lastName}`;
        applyCallsObj[document] = { id: id, documento: document, estado: status, nombre: nameComplete };
    });
    return applyCallsObj;
};

const buildInnerCenterCostObject = (centerCostData) => {
    const centerCostObj = {};
    centerCostData.forEach((element) => {
        const { centro_de_costo_cdc: name, Periocidad_de_Pago: periodicity, dias_de_pago_cdc: payDays, ID: id } = element;
        centerCostObj[name] = { id: id, nombre: name, periodicidad: periodicity, dias_pago: payDays };
    });
    return centerCostObj;
};

const buildInnerProfileObject = (profileData) => {
    const profileObj = {};
    profileData.forEach((element) => {
        const { cargo: name, ID: id, riesgo: riskLevel } = element;
        profileObj[name] = { id: id, riesgo: riskLevel };
    });
    return profileObj;
};

const buildInnerNatureCenterCostObject = (NatureCCData) => {
    return NatureCCData.reduce((obj, { id, nombre }) => {
        obj[nombre] = { id, nombre };
        return obj;
    }, {});
};

const buildInnerProyectCCObject = (proyectCCData) => {
    return proyectCCData.reduce((obj, { id, nombre }) => {
        obj[nombre] = { id, nombre };
        return obj;
    }, {});
};

const buildInnerBusinessLineObject = (businessLineData) => {
    return businessLineData.reduce((obj, { id, nombre }) => {
        obj[nombre] = { id, nombre };
        return obj;
    }, {});
};

const buildInnerAreaObject = (areaData) => {
    return areaData.reduce((obj, { id, nombre }) => {
        obj[nombre] = { id, nombre };
        return obj;
    }, {});
};

const buildInnerSubCenterObject = (subCenterData) => {
    return subCenterData.reduce((obj, { id, nombre }) => {
        obj[nombre] = { id, nombre };
        return obj;
    }, {});
};

const buildInnerGroupConceptObject = (groupConceptData) => {
    const groupConceptObj = {};
    groupConceptData.forEach((element) => {
        const { Nombre_de_Grupo: name, ID: id, Grupo: group } = element;
        groupConceptObj[name] = { id: id, nombre: name };
    });
    return groupConceptObj;
};

const buildInnerConceptObject = (groupConceptData) => {
    const conceptObj = {};
    groupConceptData.forEach((element) => {
        const { Nombre_del_Concepto: name, ID: id} = element;
        conceptObj[name] = { id: id, valor: 0, metodologia_pago: ['Proporcional dias laborados','Valor fijo mes'] };
    });
    return conceptObj;
};

const buildInnerReqObj = (element, applyCallsObj, profileObj) => {

    const { Salario_basico: salary, ESTADO: status, tipo_cont_gen_req_lp_agreg_tip_jorn: typeContract, Tipo_de_Jornada: typeWorkDay, ID: id } = element;

    const dataContract = { nombre: typeContract.Nombre, id: typeContract.ID };
    const dataWorkDay = { nombre: typeWorkDay.Nombre, id: typeWorkDay.ID };
    const salaryBasic = { min: 10, valor: salary, max: 10000000 };

    const reqObj = {
        estado: status,
        id: id,
        postulados: applyCallsObj,
        nivel_riesgo: profileObj,
        salario_basico: salaryBasic,
        tipo_contrato: dataContract,
        tipo_jornada: dataWorkDay,     
    };

    return reqObj;
};

const buildInnerDataObj = (centerCostObj, natureCCObj, proyectCCObj, businessLineObj, areaObj, subCenterObj, GroupObj, groupConceptObj) => {

    const sabadoHabil = ["SI", "NO"];
    const salarioIntegral = ["SI", "NO"];
    const fechaIngreso = null;
    const sitioTrabajo = null;
    const sitioPresentacion = null;
    const observaciones = null;

    const reqObj = {
        centro_costo: centerCostObj,
        fecha_ingreso: fechaIngreso,
        sitio_trabajo: sitioTrabajo,
        sitio_presentacion: sitioPresentacion,
        salario_integral: salarioIntegral,
        sabado_habil: sabadoHabil,
        observaciones: observaciones,
        beneficios_contrato: { grupo: GroupObj, concepto: groupConceptObj },
        naturaleza_cc: natureCCObj,
        proyecto_cc: proyectCCObj,
        linea_negocio_cc: businessLineObj,
        area_cc: areaObj,
        sub_centro_cc: subCenterObj
    };

    return reqObj;
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

        // Esperar a que ambas solicitudes se completen en paralelo
        const [responseApplyCalls, responseProfile] = await Promise.all([responseApplyCallsPromise, responseProfilePromise]);

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

const processDataFields = async (element, accessToken) => {
    const { cliente_gen_req: customer } = element;
    const { ID: customerId } = customer;

    const [ responseCostCenter, responseGroup, responseNatureCC, responseProyectoCC, responseBusinessLine, responseArea, responseSubCenter ] = await Promise.all([
        fetchData(`${BASE_URL_HQ5}Centros_de_Costo`, `empresa_usuaria_lp_cdc.ID=${customerId}`, accessToken),
        fetchData2(`${BASE_URL_COM}Grupos_de_Conceptos`, `Grupo=[E,F,G]`, accessToken),
        entryOrder.consultNature(customerId),
        entryOrder.consultProject(customerId),
        entryOrder.consultBusinessLine(customerId),
        entryOrder.consultArea(customerId),
        entryOrder.consultSubCenterCost(customerId)
    ]);

    const centerCostObj = responseCostCenter?.data && Array.isArray(responseCostCenter.data) ?
        buildInnerCenterCostObject(responseCostCenter.data) : {};

    const GroupObj = responseGroup?.data && Array.isArray(responseGroup.data) ?
        buildInnerGroupConceptObject(responseGroup.data) : {};

    let groupConceptObj = {};
    if (GroupObj) {
        await Promise.all(Object.entries(GroupObj).map(async ([key, value]) => {
            const responseConcept = await fetchData2(`${BASE_URL_COM}Conceptos`, `Grupo_Conceptos.ID=${value.id}&Valido_desde_la_orden_de_ingreso=true`, accessToken);
            if (responseConcept?.data && Array.isArray(responseConcept.data)) {
                const ConceptObj = buildInnerConceptObject(responseConcept.data, value.id);
                groupConceptObj[value.nombre] = ConceptObj;
            }
        }));
    }

    const natureCCObj = responseNatureCC && responseNatureCC.length > 0 ? buildInnerNatureCenterCostObject(responseNatureCC) : {};
    const proyectCCObj = responseProyectoCC && responseProyectoCC.length > 0 ? buildInnerProyectCCObject(responseProyectoCC) : {};
    const businessLineObj = responseBusinessLine && responseBusinessLine.length > 0 ? buildInnerBusinessLineObject(responseBusinessLine) : {};
    const areaObj = responseArea && responseArea.length > 0 ? buildInnerAreaObject(responseArea) : {};
    const subCenterObj = responseSubCenter && responseSubCenter.length > 0 ? buildInnerSubCenterObject(responseSubCenter) : {};

    const dataObj = buildInnerDataObj(centerCostObj, natureCCObj, proyectCCObj, businessLineObj, areaObj, subCenterObj, GroupObj, groupConceptObj);

    return dataObj;
};

export const getFieldValue = async (customerId) => {
    try {
        const accessToken = await getAccessToken();
        console.log(accessToken);

        if (!accessToken) {
            console.log('No se pudo obtener el Access Token');
            return null;
        }

        const response = await fetchData2(`${BASE_URL_HQ5}Todas_las_Requisiciones`, `cliente_gen_req.ID=${customerId}&ESTADO=ACEPTADA`, accessToken);

        if (response && response?.data && Array.isArray(response.data) && response.data.length > 0) {
            
            console.log("Procesando...");
            // const dataObj = await processDataFields(response.data[0], accessToken);
            // const reqObj = await processRequisitionData(response.data, accessToken);
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