import * as entryOrder from './entryOrderQuery.function.js';
import { contactRecordExistsById } from '../../Database/contact.query.js';
import { WORK_DAY_COM, WORK_DAY_DEST, WORK_DAY_DAYS } from '../../Database/fields.js';

// Funcion para generar objeto de aplicar convocatorias
const buildInnerApplyCallsObject = (data) => {
    return data.reduce((obj, { id, documento, nombre }) => ({ ...obj, [documento]: { id, nombre } }), {});
};

// Funcion para generar objeto de centro de costo
const buildInnerCenterCostObject = (data) => {
    return data.reduce((obj, { id, nombre, periodicidad, dias_pago }) => ({ ...obj, [nombre]: { id, periodicidad, dias_pago } }), {});
};

// Funcion para generar objeto de perfil
const buildInnerProfileObject = (data) => {
    const { nombre, id, nivel_riesgo } = (data && data[0]) || {};
    return { id, nombre, nivel_riesgo };
};

// Funcion para generar objeto de naturaleza centro de costo
const buildInnerNatureCenterCostObject = (data) => {
    return data.reduce((obj, { id, nombre }) => ({ ...obj, [nombre]: { id } }), {});
};

// Funcion para generar objeto de proyecto
const buildInnerProyectObject = (data) => {
    return data.reduce((obj, { id, nombre }) => ({ ...obj, [nombre]: { id } }), {});
};

// Funcion para generar objeto de linea de negocio
const buildInnerBusinessLineObject = (data) => {
    return data.reduce((obj, { id, nombre }) => ({ ...obj, [nombre]: { id } }), {});
};

// Funcion para generar objeto de area
const buildInnerAreaObject = (data) => {
    return data.reduce((obj, { id, nombre }) => ({ ...obj, [nombre]: { id } }), {});
};

// Funcion para generar objeto de subcentro de costo
const buildInnerSubCenterObject = (data) => {
    return data.reduce((obj, { id, nombre }) => ({ ...obj, [nombre]: { id } }), {});
};

// Funcion para generar objeto de grupo de concepto
const buildInnerGroupConceptObject = (data) => {
    return data.reduce((obj, { id, nombre }) => ({ ...obj, [nombre]: { id, nombre } }), {});
};

// Funcion para generar objeto de concepto
const buildInnerConceptObject = (data) => {
    return data.reduce((obj, { id, nombre }) => ({ ...obj, [nombre]: { id, valor: 0, metodologia_pago: ['Proporcional días laborados', 'Valor fijo mes'] } }), {});
};

// Funcion para generar objeto de beneficio de contrato
const buildInnerContractBenefitObject = (data) => {
    return data.map(({ id, id_grupo, n_grupo, id_concepto, n_concepto, valor, m_pago, id_req, id_perfil, n_perfil }) => ({
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

// Funcion para generar objeto de requisicion
const buildInnerReqObj = (element, baseValues, applyCallObj, profileObj, centerCostObj, contractBenefitObj, options) => {

    const { id: id, salario: salary, tipo_contrato: typeContract, tipo_jornada: typeWorkDay } = element;
    const { salario: salaryBase, subsidio_transporte: subsidyTransport} = baseValues[0];

    const isTypeWorkDayMatching = (typeWorkDay === WORK_DAY_COM || typeWorkDay === WORK_DAY_DEST || typeWorkDay === WORK_DAY_DAYS);
    const salaryMin = isTypeWorkDayMatching  ? parseInt(salaryBase) : 0;
    const subsidyTransportRequired = isTypeWorkDayMatching && (salary < (parseInt(salaryBase) * 2));
    const salaryMax = 50000000;

    const salaryBasic = {
        min: salaryMin,
        valor: salary,
        max: salaryMax,
        salario_minimo: parseInt(salaryBase),
        subsidio_transporte: parseInt(subsidyTransport),
        subsidio_transporte_required: subsidyTransportRequired
    };

    // Verificar si el objeto options está vacío
    if (Object.keys(options).length === 0) {
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
    }

    const {
        nivel_riesgo,
        salario,
        centro_costo,
        id_postulado
    } = options;

    if (nivel_riesgo !== null) {
        profileObj.nivel_riesgo = nivel_riesgo;
        profileObj.select = true;
    }

    if (salario !== null) {
        salaryBasic.valor = salario;
        salaryBasic.select = true;
    }

    for (const key in centerCostObj) {
        if (centerCostObj[key].id === centro_costo) {
            centerCostObj[key].select = true;
            break;
        }
    }

    for (const key in applyCallObj) {
        if (id_postulado.includes(applyCallObj[key].id)) {
            applyCallObj[key].select = true;
        }
    }

    return {
        id: id,
        select: true,
        postulados: applyCallObj,
        nivel_riesgo: profileObj,
        salario_basico: salaryBasic,
        tipo_contrato: typeContract,
        tipo_jornada: typeWorkDay,
        centro_costo: centerCostObj,
        beneficios_contrato: contractBenefitObj     
    };
};

// Funcion para generar objeto de data global
const buildInnerDataObj = (natureCCObj, proyectCCObj, businessLineObj, areaObj, subCenterObj, groupConceptObj, options) => {

    // Verificar si el objeto options está vacío
    if (Object.keys(options).length === 0) {
        return {
            id: null,
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
    }

    const {
        id,
        fecha_ingreso,
        sitio_trabajo,
        sitio_presentacion,
        salario_integral,
        sabado_habil,
        observaciones,
        naturaleza_centro_costo,
        proyecto,
        linea_negocio,
        area,
        sub_centro_costo
    } = options;

    if (naturaleza_centro_costo !== null) {
        const matchingObj = Object.values(natureCCObj).find(obj => obj.id === naturaleza_centro_costo);
        if (matchingObj) {matchingObj.select = true;}
    }

    if (proyecto !== null) {
        const matchingObj = Object.values(proyectCCObj).find(obj => obj.id === proyecto);
        if (matchingObj) { matchingObj.select = true; }
    }    

    if (linea_negocio !== null) {
        const matchingObj = Object.values(businessLineObj).find(obj => obj.id === linea_negocio);
        if (matchingObj) { matchingObj.select = true; }
    }
    
    if (area !== null) {
        const matchingObj = Object.values(areaObj).find(obj => obj.id === area);
        if (matchingObj) { matchingObj.select = true; }
    }
    
    if (sub_centro_costo !== null) {
        const matchingObj = Object.values(subCenterObj).find(obj => obj.id === sub_centro_costo);
        if (matchingObj) { matchingObj.select = true; }
    }    

    return {
        id,
        fecha_ingreso,
        sitio_trabajo,
        sitio_presentacion,
        salario_integral: [salario_integral],
        sabado_habil: [sabado_habil],
        observaciones,
        beneficios_contrato: { grupo: groupConceptObj },
        naturaleza_cc: natureCCObj,
        proyecto_cc: proyectCCObj,
        linea_negocio_cc: businessLineObj,
        area_cc: areaObj,
        sub_centro_cc: subCenterObj
    };
};

// Funcion para procesar los datos de la requisicion en la creacion de ordenes de ingreso masivas
const processRequisitionDataCreate = async (responseData, baseValues, options = {}) => {
    const reqObj = {};

    for (const element of responseData) {
        const { nombre: reqName, id: reqId, id_profile: profileId, id_cliente: customerId, id_ciudad: cityId } = element;

        const [
                responseApplyCalls,
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

        const applyCallObjLength = Object.keys(applyCallObj).length;
        const innerObj = applyCallObjLength > 0 ? buildInnerReqObj(element, baseValues, applyCallObj, profileObj, centerCostObj, contractBenefitObj, options) : null;
      
        if (innerObj) {
          reqObj[reqName] = innerObj;
        }
      }

    return reqObj;
};

// Funcion para procesar los datos de la requisicion en la edicion de ordenes de ingreso masivas
const processRequisitionDataEdit = async (responseData, baseValues, options = {}) => {
    const reqObj = {};

    for (const element of responseData) {
        const { nombre: reqName, id_postulado: applyCallId, id_profile: profileId, id_cliente: customerId, id_ciudad: cityId, id: entryOrderMid } = element;

        const [ 
                responseApplyCalls, 
                responseProfile,
                responseCostCenter,
                responseContractBenefit
            ] = await Promise.all([
            entryOrder.consultApplyCallById(applyCallId),
            entryOrder.consultProfile(profileId),
            entryOrder.consultCostCenter(customerId, cityId),
            entryOrder.consultContractBenefitByIdEntryOrderM(entryOrderMid)
        ]);
    
        const applyCallObj = responseApplyCalls && responseApplyCalls.length > 0 ? buildInnerApplyCallsObject(responseApplyCalls) : {};    
        const profileObj = responseProfile && responseProfile.length > 0 ? buildInnerProfileObject(responseProfile) : {};
        const centerCostObj = responseCostCenter && responseCostCenter.length > 0 ? buildInnerCenterCostObject(responseCostCenter) : {};
        const contractBenefitObj = responseContractBenefit && responseContractBenefit.length > 0 ? buildInnerContractBenefitObject(responseContractBenefit) : {};

        const applyCallObjLength = Object.keys(applyCallObj).length;
        const innerObj = applyCallObjLength > 0 ? buildInnerReqObj(element, baseValues, applyCallObj, profileObj, centerCostObj, contractBenefitObj, options) : null;
      
        if (innerObj) {
          reqObj[reqName] = innerObj;
        }
      }

    return reqObj;
};

// Funcion para procesar las consultas globales de los campos
const processDataFields = async (element, options = {}) => {
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
    const proyectCCObj = responseProyectoCC && responseProyectoCC.length > 0 ? buildInnerProyectObject(responseProyectoCC) : {};
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

    const dataObj = buildInnerDataObj(natureCCObj, proyectCCObj, businessLineObj, areaObj, subCenterObj, groupConceptObj, options);
    return dataObj;
};

// Funcion para obtener los campos de las ordenes de ingreso masivas en el proceso de creacion
export const getFieldValueCreate = async (customerId, contact) => {
    try {

        const [responseReq, baseValues] = await Promise.all([
            entryOrder.consultRequisition(customerId),
            entryOrder.consultBaseValues()
        ]);
        
        if (responseReq && responseReq.length > 0) {
            
            const [
                dataObj, 
                reqObj
            ] = await Promise.all([ 
                processDataFields(responseReq[0]), 
                processRequisitionDataCreate(responseReq, baseValues) 
            ]);

            const contObj = { contacto: contact};
            const reqObjF = { requisicion: reqObj};
            const combinedObj = Object.assign({}, contObj, dataObj, reqObjF);
            const entOrdObj = { orden_ingreso: { campos: combinedObj } };

            return entOrdObj;

        } else {
            console.error('Tabla requision vacia');
            return null;
        }

    } catch (error) {
        console.error('Error al obtener los valores del formulario: getFieldValueCreate', error.message);
        return null;
    }
};

// Funcion para obtener los campos de las ordenes de ingreso masivas en el proceso de edicion
export const getFieldValueEdit = async (entryOrderMId) => {
    try {
        const [
                responseEntryOrderM, 
                baseValues
            ] = await Promise.all([
            entryOrder.consultEntryOrderM(entryOrderMId),
            entryOrder.consultBaseValues()
        ]);

        if (responseEntryOrderM && responseEntryOrderM.length > 0) {

            const {
                id,
                fecha_ingreso,
                sitio_trabajo,
                sitio_presentacion,
                salario_integral,
                sabado_habil,
                observaciones, 
                naturaleza_centro_costo, 
                proyecto, 
                linea_negocio, 
                area, 
                sub_centro_costo,
                nivel_riesgo,
                salario,
                centro_costo,
                id_postulado,
                id_contacto
            } = responseEntryOrderM[0];

            const entryDate = new Date(fecha_ingreso);
            const optionDate = { day: '2-digit', month: 'short', year: 'numeric' };
            const formattedDate = entryDate.toLocaleDateString('en-GB', optionDate).replace(/ /g, '-');

            const options = { 
                id,
                fecha_ingreso: formattedDate, 
                sitio_trabajo, 
                sitio_presentacion, 
                salario_integral, 
                sabado_habil, 
                observaciones, 
                naturaleza_centro_costo, 
                proyecto, 
                linea_negocio, 
                area, 
                sub_centro_costo,
                nivel_riesgo,
                salario,
                centro_costo,
                id_postulado
            };

            const responseReq = await entryOrder.consultRequisitionId(responseEntryOrderM[0].id_requisicion);

            if (responseReq && responseReq.length > 0) {

                responseEntryOrderM[0].tipo_jornada = responseReq[0].tipo_jornada;
                responseEntryOrderM[0].tipo_contrato = responseReq[0].tipo_contrato;
                responseEntryOrderM[0].id_profile = responseReq[0].id_profile;
                responseEntryOrderM[0].nombre = responseReq[0].nombre;

                const [
                    dataObj, 
                    reqObj,
                    contObj
                ] = await Promise.all([ 
                    processDataFields(responseReq[0], options), 
                    processRequisitionDataEdit(responseEntryOrderM, baseValues, options),
                    contactRecordExistsById(id_contacto)
                ]);

                const contObjF = { contacto: contObj[0].id};
                const reqObjF = { requisicion: reqObj};
                const combinedObj = Object.assign({}, contObjF, dataObj, reqObjF);
                
                const entOrdObj = { orden_ingreso: { campos: combinedObj } };

                return entOrdObj;
    
            } else {
                console.error('Tabla requisición vacía');
                return null;
            }

        } else {
            console.error('Tabla orden ingreso masivo vacía');
            return null;
        }

    } catch (error) {
        console.error('Error al obtener los valores del formulario: getFieldValueEdit', error.message);
        return null;
    }
};