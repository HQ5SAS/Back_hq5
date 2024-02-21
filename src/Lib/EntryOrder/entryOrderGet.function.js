import * as entryOrder from './entryOrderQuery.function.js';
import { WORK_DAY_COM, WORK_DAY_DEST, WORK_DAY_DAYS } from '../../Database/fields.js';

const buildInnerApplyCallsObject = (applyCallsData) => {
    return applyCallsData.reduce((obj, { id, documento, nombre, id_hv }) => ({ ...obj, [documento]: { id, nombre, id_hv } }), {});
};

const buildInnerCenterCostObject = (centerCostData) => {
    return centerCostData.reduce((obj, { id, nombre, periodicidad, dias_pago }) => ({ ...obj, [nombre]: { id, periodicidad, dias_pago } }), {});
};

const buildInnerProfileObject = (profileData) => {
    const [profileObj] = profileData || [];
    const { nombre, id, nivel_riesgo } = profileObj || {};
    return { id, nombre, nivel_riesgo };
};

const buildInnerNatureCenterCostObject = (NatureCCData) => {
    return NatureCCData.reduce((obj, { id, nombre }) => ({ ...obj, [nombre]: { id } }), {});
};

const buildInnerProyectCCObject = (proyectCCData) => {
    return proyectCCData.reduce((obj, { id, nombre }) => ({ ...obj, [nombre]: { id } }), {});
};

const buildInnerBusinessLineObject = (businessLineData) => {
    return businessLineData.reduce((obj, { id, nombre }) => ({ ...obj, [nombre]: { id } }), {});
};

const buildInnerAreaObject = (areaData) => {
    return areaData.reduce((obj, { id, nombre }) => ({ ...obj, [nombre]: { id } }), {});
};

const buildInnerSubCenterObject = (subCenterData) => {
    return subCenterData.reduce((obj, { id, nombre }) => ({ ...obj, [nombre]: { id } }), {});
};

const buildInnerGroupConceptObject = (groupConceptData) => {
    return groupConceptData.reduce((obj, { id, nombre }) => ({ ...obj, [nombre]: { id, nombre } }), {});
};

const buildInnerConceptObject = (conceptData) => {
    return conceptData.reduce((obj, { id, nombre }) => ({ ...obj, [nombre]: { id, valor: 0, metodologia_pago: ['Proporcional días laborados', 'Valor fijo mes'] } }), {});
};

const buildInnerContractBenefitObject = (contractBenefitData) => {
    // return contractBenefitData.reduce((obj, { id, id_grupo, n_grupo, id_concepto, n_concepto, valor, m_pago, id_req, id_perfil, n_perfil }) => (
    //     { ...obj, [id_req]: { id, id_grupo, n_grupo, id_concepto, n_concepto, valor, m_pago, id_req, id_perfil, n_perfil } }
    //     ), {});

    return contractBenefitData.map(({ id, id_grupo, n_grupo, id_concepto, n_concepto, valor, m_pago, id_req, id_perfil, n_perfil }) => ({
        id,
        id_grupo,
        n_grupo,
        id_concepto,
        n_concepto,
        valor,
        m_pago,
        id_req,
        id_perfil,
        n_perfil
    }));
};

const buildInnerReqObj = (element, baseValues, applyCallObj, profileObj, centerCostObj, contractBenefitObj) => {

    const { id: id, salario: salary, tipo_contrato: typeContract, tipo_jornada: typeWorkDay } = element;
    const { salario: salaryBase, subsidio_transporte: subsidyTransport} = baseValues[0];

    const salaryMin = (typeWorkDay.includes(WORK_DAY_COM, WORK_DAY_DEST, WORK_DAY_DAYS)) ? parseInt(salaryBase) : 0;
    const subsidyTransportRequired = salary > (parseInt(salaryBase) * 2);
    const salaryMax = 50000000;

    const salaryBasic = {
        min: salaryMin,
        valor: salary,
        max: salaryMax,
        salario_minimo: parseInt(salaryBase),
        subsidio_transporte: parseInt(subsidyTransport),
        subsidio_transporte_required: subsidyTransportRequired
    };

    return {
        id: id,
        postulados: applyCallObj,
        nivel_riesgo: profileObj,
        salario_basico: salaryBasic,
        tipo_contrato: typeContract,
        tipo_jornada: typeWorkDay,
        centro_costo: centerCostObj,
        beneficios_contrato: contractBenefitObj     
    };
};

const buildInnerDataObj = (natureCCObj, proyectCCObj, businessLineObj, areaObj, subCenterObj, groupConceptObj) => {
    return {
        fecha_ingreso: null,
        sitio_trabajo: null,
        sitio_presentacion: null,
        salario_integral: ["SI", "NO"],
        sabado_habil: ["SI", "NO"],
        observaciones: null,
        beneficios_contrato: { grupo: groupConceptObj },
        naturaleza_cc: natureCCObj,
        proyecto_cc: proyectCCObj,
        linea_negocio_cc: businessLineObj,
        area_cc: areaObj,
        sub_centro_cc: subCenterObj
    };
};

const processRequisitionData = async (responseData, baseValues) => {
    const reqObj = {};

    const promises = responseData.map(async (element) => {
        const { nombre: reqName, id: reqId, id_profile: profileId, id_cliente: customerId, id_ciudad: cityId } = element;
        
        const [ responseApplyCalls, 
                responseProfile,
                responseCostCenter,
                responseContractBenefit
            ] = await Promise.all([
            entryOrder.consultApplyCall(reqId),
            entryOrder.consultProfile(profileId),
            entryOrder.consultCostCenter(customerId, cityId),
            entryOrder.consultContractBenefit(reqId)
        ]);

        const applyCallObj = responseApplyCalls && responseApplyCalls.length > 0 ? buildInnerApplyCallsObject(responseApplyCalls) : {};    
        const profileObj = responseProfile && responseProfile.length > 0 ? buildInnerProfileObject(responseProfile) : {};
        const centerCostObj = responseCostCenter && responseCostCenter.length > 0 ? buildInnerCenterCostObject(responseCostCenter) : {};
        const contractBenefitObj = responseContractBenefit && responseContractBenefit.length > 0 ? buildInnerContractBenefitObject(responseContractBenefit) : {};

        const innerObj = Object.keys(applyCallObj).length > 0 ? buildInnerReqObj(element, baseValues, applyCallObj, profileObj, centerCostObj, contractBenefitObj) : null;

        if (innerObj) {
            reqObj[reqName] = innerObj;
        }
    });

    await Promise.all(promises);
    return reqObj;
};

const processDataFields = async (element) => {
    const { id_cliente: customerId } = element;

    const [ responseNatureCC, 
            responseProyectoCC, 
            responseBusinessLine, 
            responseArea, 
            responseSubCenter, 
            responseGroup 
        ] = await Promise.all([
        entryOrder.consultNature(customerId),
        entryOrder.consultProject(customerId),
        entryOrder.consultBusinessLine(customerId),
        entryOrder.consultArea(customerId),
        entryOrder.consultSubCenterCost(customerId),
        entryOrder.consultGroup()
    ]);

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
        const conceptObj = responseConcept && responseConcept.length > 0 ? buildInnerConceptObject(responseConcept) : {};

        groupConceptObj[value.nombre] = {
        id: value.id,
        nombre: value.nombre,
        concepto: conceptObj,
        };
    }));
    }

    const dataObj = buildInnerDataObj(natureCCObj, proyectCCObj, businessLineObj, areaObj, subCenterObj, groupConceptObj);
    return dataObj;
};

export const getFieldValue = async (customerId) => {
    try {

        const responseReq = await entryOrder.consultRequisition(customerId);
        const baseValues = await entryOrder.consultBaseValues();

        if (responseReq && responseReq.length > 0) {

            const [dataObj, reqObj] = await Promise.all([ processDataFields(responseReq[0]), processRequisitionData(responseReq, baseValues) ]);

            const reqObjF = { requisicion: reqObj};
            const combinedObj = Object.assign({}, dataObj, reqObjF);
            const entOrdObj = { orden_ingreso: { campos: combinedObj } };

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