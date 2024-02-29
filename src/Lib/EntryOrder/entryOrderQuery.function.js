import { natureRecordExistsByIdCustomer } from '../../Database/nature.query.js';
import { projectRecordExistsByIdCustomer } from '../../Database/project.query.js';
import { businessLineRecordExistsByIdCustomer } from '../../Database/businessLine.quey.js';
import { areaRecordExistsByIdCustomer } from '../../Database/area.query.js';
import { subCostCenterRecordExistsByIdCustomer } from '../../Database/subCostCenter.query.js';
import { requisitionRecordExistsById, requisitionRecordExistsByIdCustomer } from '../../Database/requisition.query.js';
import { costCenterRecordExistsByIdCustomerIdCity } from '../../Database/costCenter.query.js';
import { groupRecordExistsByGroup } from '../../Database/group.query.js';
import { conceptRecordExistsByIdGroup } from '../../Database/concept.query.js';
import { profileRecordExistsById } from '../../Database/profile.query.js';
import { applyCallRecordExistsById, applyCallRecordExistsByIdReq } from '../../Database/applyCall.query.js';
import { baseValuesByYear } from '../../Database/baseValues.query.js';
import { contractBenefitRecordExistsByIdEntryOrderM, contractBenefitRecordExistsByIdReq } from '../../Database/contractBenefit.query.js';
import { entryOrderMRecordExistsById } from '../../Database/entryOrderM.query.js';
import { entryOrderRecordExistsByIdMas } from '../../Database/entryOrder.query.js';
import { createErrorResponse } from '../../Tools/utils.js';

// Funcion global para ejecucion de consultas
async function consultRecord(recordFunction, recordType, ...args) {
    try {
        return await recordFunction(...args);

    } catch (error) {
        console.error(`Error al obtener ${recordType}`, error);
        throw createErrorResponse(`Error al obtener ${recordType}`, 400);
    }
}

// Funcion para consultar naturaleza de centro de costo por customerId
export async function consultNature(customerId) {
    return consultRecord(natureRecordExistsByIdCustomer, 'la naturaleza del centro de costo', customerId);
}

// Funcion para consultar proyecto por customerId
export async function consultProject(customerId) {
    return consultRecord(projectRecordExistsByIdCustomer, 'el project', customerId);
}

// Funcion para consultar linea de negocio por customerId
export async function consultBusinessLine(customerId) {
    return consultRecord(businessLineRecordExistsByIdCustomer, 'la linea de negocio', customerId);
}

// Funcion para consultar area por customerId
export async function consultArea(customerId) {
    return consultRecord(areaRecordExistsByIdCustomer, 'el area', customerId);
}

// Funcion para consultar subcentros de costo por customerId
export async function consultSubCenterCost(customerId) {
    return consultRecord(subCostCenterRecordExistsByIdCustomer, 'el sub centro de costo', customerId);
}

// Funcion para consultar requisiciones por customerId
export async function consultRequisition(customerId) {
    return consultRecord(requisitionRecordExistsByIdCustomer, 'la requisicion', customerId);
}

// Funcion para consultar requisiciones por requisicionId
export async function consultRequisitionId(requisicionId) {
    return consultRecord(requisitionRecordExistsById, 'la requisicion', requisicionId);
}

// Funcion para consultar centros de costo por customerId, cityId
export async function consultCostCenter(customerId, cityId) {
    return consultRecord(costCenterRecordExistsByIdCustomerIdCity, 'el centro de costo', customerId, cityId);
}

// Funcion para consultar grupos de conceptos
export async function consultGroup() {
    return consultRecord(groupRecordExistsByGroup, 'los grupos de conceptos');
}

// Funcion para consultar conceptos por groupId
export async function consultConcept(groupId) {
    return consultRecord(conceptRecordExistsByIdGroup, 'los conceptos', groupId);
}

// Funcion para consultar perfil por profileId
export async function consultProfile(profileId) {
    return consultRecord(profileRecordExistsById, 'el perfil', profileId);
}

// Funcion para consultar aplicar convocatorias por reqId
export async function consultApplyCall(reqId) {
    return consultRecord(applyCallRecordExistsByIdReq, 'aplicar convocatoria', reqId);
}

// Funcion para consultar aplicar convocatorias por Id
export async function consultApplyCallById(Id) {
    return consultRecord(applyCallRecordExistsById, 'aplicar convocatoria', Id);
}

// Funcion para consultar valores base
export async function consultBaseValues() {
    return consultRecord(baseValuesByYear, 'los valores base');
}

// Funcion para consultar beneficios del contrato por reqId
export async function consultContractBenefit(reqId) {
    return consultRecord(contractBenefitRecordExistsByIdReq, 'los beneficios del contrato', reqId);
}

// Funcion para consultar beneficios del contrato por entryOrderMId
export async function consultContractBenefitByIdEntryOrderM(entryOrderMId) {
    return consultRecord(contractBenefitRecordExistsByIdEntryOrderM, 'los beneficios del contrato', entryOrderMId);
}

// Funcion para consultar orden de ingreso masiva por entryOrderMId
export async function consultEntryOrderM(entryOrderMId) {

    const responseEOM = await consultRecord(entryOrderMRecordExistsById, 'la orden de ingreso masiva', entryOrderMId);
    const entryOrderEOMId = responseEOM[0]?.id;

    if (!entryOrderEOMId) {
        return null;
    }

    const responseEO = await consultRecord(entryOrderRecordExistsByIdMas, 'la orden de ingreso', entryOrderEOMId);

    return {
        id_requisicion: responseEO[0]?.id_requisicion,
        id_cliente: responseEO[0]?.id_cliente,
        id_ciudad: responseEO[0]?.id_ciudad,
        id_postulado: responseEO.map(item => item.id_postulado),
        ...responseEOM[0]
    };
}