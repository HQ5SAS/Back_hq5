import { getAccessToken } from '../../Tools/zoho.js';
import fetch from 'node-fetch';
import fs from 'fs/promises';

// Es posible eliminar este archivo era el primero para integracion con Zoho creator - Delete de one

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

const buildInnerNatureCenterCostObject = (natureCenterCostData) => {
    const natureCenterCostObj = {};
    natureCenterCostData.forEach((element) => {
        const { Descripci_n: name, ID: id } = element;
        natureCenterCostObj[name] = { id: id, nombre: name };
    });
    return natureCenterCostObj;
};

const buildInnerProyectCCObject = (proyectCCData) => {
    const proyectCCObj = {};
    proyectCCData.forEach((element) => {
        const { Descripci_n: name, ID: id } = element;
        proyectCCObj[name] = { id: id, nombre: name };
    });
    return proyectCCObj;
};

const buildInnerBusinessLineObject = (businessLineData) => {
    const businessLineObj = {};
    businessLineData.forEach((element) => {
        const { Descripci_n: name, ID: id } = element;
        businessLineObj[name] = { id: id, nombre: name };
    });
    return businessLineObj;
};

const buildInnerAreaObject = (areaData) => {
    const areaObj = {};
    areaData.forEach((element) => {
        const { descripcion: name, ID: id } = element;
        areaObj[name] = { id: id, nombre: name };
    });
    return areaObj;
};

const buildInnerSubCenterObject = (subCenterData) => {
    const subCenterObj = {};
    subCenterData.forEach((element) => {
        const { Sub_centro_de_costo: name, ID: id } = element;
        subCenterObj[name] = { id: id, nombre: name };
    });
    return subCenterObj;
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

// const processRequisitionData = async (responseData, accessToken) => {
//     const reqObj = {};

//     for (const element of responseData) {

//         const { id_req_gen_req: reqNumber, ID: reqId, cargo_gen_req_lp_perf: profile } = element;
//         const { ID: profileId } = profile;

//         // faltaria validacion de orden ingreso
//         const responseApplyCalls = await fetchData(`${BASE_URL_HQ5}vista_general`, `REQUISICION_RELATED.ID=${reqId}`, accessToken);
//         const applyCallsObj = responseApplyCalls && Array.isArray(responseApplyCalls.data) ?
//             buildInnerApplyCallsObject(responseApplyCalls.data) : {};

//         const responseProfile = await fetchData(`${BASE_URL_HQ5}Perfiles_Report`, `ID=${profileId}`, accessToken);
//         const profileObj = responseProfile?.data && Array.isArray(responseProfile.data) ?
//             buildInnerProfileObject(responseProfile.data) : {};
        
//         const innerObj = buildInnerReqObj(element, applyCallsObj, profileObj);
//         reqObj[reqNumber] = innerObj;    
//     }

//     return reqObj;
// }

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


// const processDataFields = async (element, accessToken) => {
//     const { cliente_gen_req: customer } = element;
//     const { ID: customerId } = customer;

//     const responseCostCenter = await fetchData(`${BASE_URL_HQ5}Centros_de_Costo`, `empresa_usuaria_lp_cdc.ID=${customerId}`, accessToken);
//     const centerCostObj = responseCostCenter?.data && Array.isArray(responseCostCenter.data) ?
//         buildInnerCenterCostObject(responseCostCenter.data) : {};

//     const responseGroup = await fetchData2(`${BASE_URL_COM}Grupos_de_Conceptos`, `Grupo=[E,F,G]`, accessToken);
//     const GroupObj = responseGroup?.data && Array.isArray(responseGroup.data) ?
//         buildInnerGroupConceptObject(responseGroup.data) : {};

//     let groupConceptObj = {};
//     if (GroupObj) {
//         for (const key in GroupObj) {
//             if (GroupObj.hasOwnProperty(key)) {
//                 const value = GroupObj[key];
//                 const responseConcept = await fetchData2(`${BASE_URL_COM}Conceptos`, `Grupo_Conceptos.ID=${value.id}&Valido_desde_la_orden_de_ingreso=true`, accessToken);
//                 let ConceptObj = {};
//                 if (responseConcept?.data && Array.isArray(responseConcept.data)) {
//                     ConceptObj = buildInnerConceptObject(responseConcept.data, value.id);
//                     groupConceptObj[value.nombre] = ConceptObj;
//                 }
//             }
//         }
//     }
    
//     const responseNatureCC = await fetchData(`${BASE_URL_HQ5}Naturaleza_Centro_Costo_Report`, `Cliente.ID=${customerId}`, accessToken);
//     const natureCCObj = responseNatureCC?.data && Array.isArray(responseNatureCC.data) ?
//         buildInnerNatureCenterCostObject(responseNatureCC.data) : {};

//     const responseProyectoCC = await fetchData(`${BASE_URL_HQ5}Proyecto_Report`, `CLIENTE1.ID=${customerId}`, accessToken);
//     const proyectCCObj = responseProyectoCC?.data && Array.isArray(responseProyectoCC.data) ?
//         buildInnerProyectCCObject(responseProyectoCC.data) : {};

//     const responseBusinessLine = await fetchData(`${BASE_URL_HQ5}Lineas_de_Negocio_Report`, `Cliente.ID=${customerId}`, accessToken);
//     const businessLineObj = responseBusinessLine?.data && Array.isArray(responseBusinessLine.data) ?
//         buildInnerBusinessLineObject(responseBusinessLine.data) : {};

//     const responseArea = await fetchData(`${BASE_URL_HQ5}Areas_report`, `CLIENTE1.ID=${customerId}`, accessToken);
//     const areaObj = responseArea?.data && Array.isArray(responseArea.data) ?
//         buildInnerAreaObject(responseArea.data) : {};

//     const responseSubCenter = await fetchData(`${BASE_URL_HQ5}Sub_centros_de_costo_Report`, `empresa_usuaria_lp_cli.ID==${customerId}`, accessToken);
//     const subCenterObj = responseSubCenter?.data && Array.isArray(responseSubCenter.data) ?
//         buildInnerSubCenterObject(responseSubCenter.data) : {};

//     const dataObj = buildInnerDataObj(centerCostObj, natureCCObj, proyectCCObj, businessLineObj, areaObj, subCenterObj, GroupObj, groupConceptObj);

//     return dataObj;
// }

const processDataFields = async (element, accessToken) => {
    const { cliente_gen_req: customer } = element;
    const { ID: customerId } = customer;

    const [
        responseCostCenter,
        responseGroup,
        responseNatureCC,
        responseProyectoCC,
        responseBusinessLine,
        responseArea,
        responseSubCenter
    ] = await Promise.all([
        fetchData(`${BASE_URL_HQ5}Centros_de_Costo`, `empresa_usuaria_lp_cdc.ID=${customerId}`, accessToken),
        fetchData2(`${BASE_URL_COM}Grupos_de_Conceptos`, `Grupo=[E,F,G]`, accessToken),
        fetchData(`${BASE_URL_HQ5}Naturaleza_Centro_Costo_Report`, `Cliente.ID=${customerId}`, accessToken),
        fetchData(`${BASE_URL_HQ5}Proyecto_Report`, `CLIENTE1.ID=${customerId}`, accessToken),
        fetchData(`${BASE_URL_HQ5}Lineas_de_Negocio_Report`, `Cliente.ID=${customerId}`, accessToken),
        fetchData(`${BASE_URL_HQ5}Areas_report`, `CLIENTE1.ID=${customerId}`, accessToken),
        fetchData(`${BASE_URL_HQ5}Sub_centros_de_costo_Report`, `empresa_usuaria_lp_cli.ID==${customerId}`, accessToken)
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

    const natureCCObj = responseNatureCC?.data && Array.isArray(responseNatureCC.data) ?
        buildInnerNatureCenterCostObject(responseNatureCC.data) : {};

    const proyectCCObj = responseProyectoCC?.data && Array.isArray(responseProyectoCC.data) ?
        buildInnerProyectCCObject(responseProyectoCC.data) : {};

    const businessLineObj = responseBusinessLine?.data && Array.isArray(responseBusinessLine.data) ?
        buildInnerBusinessLineObject(responseBusinessLine.data) : {};

    const areaObj = responseArea?.data && Array.isArray(responseArea.data) ?
        buildInnerAreaObject(responseArea.data) : {};

    const subCenterObj = responseSubCenter?.data && Array.isArray(responseSubCenter.data) ?
        buildInnerSubCenterObject(responseSubCenter.data) : {};

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
            // const dataObj = await processDataFields(response.data[0], accessToken);
            // const reqObj = await processRequisitionData(response.data, accessToken);
            const [dataObj, reqObj] = await Promise.all([
                processDataFields(response.data[0], accessToken),
                processRequisitionData(response.data, accessToken)
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