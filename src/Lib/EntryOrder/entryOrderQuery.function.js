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

async function consultRecord(recordFunction, recordType, ...args) {
    try {
        const response = await recordFunction(...args);
        return response;
    } catch (error) {
        console.error(`Error al obtener ${recordType}`, error);
        throw createErrorResponse(`Error al obtener ${recordType}`, 400);
    }
}

export async function consultNature(customerId) {
    return consultRecord(natureRecordExistsByIdCustomer, 'la naturaleza del centro de costo', customerId);
}

export async function consultProject(customerId) {
    return consultRecord(projectRecordExistsByIdCustomer, 'el project', customerId);
}

export async function consultBusinessLine(customerId) {
    return consultRecord(businessLineRecordExistsByIdCustomer, 'la linea de negocio', customerId);
}

export async function consultArea(customerId) {
    return consultRecord(areaRecordExistsByIdCustomer, 'el area', customerId);
}

export async function consultSubCenterCost(customerId) {
    return consultRecord(subCostCenterRecordExistsByIdCustomer, 'el sub centro de costo', customerId);
}

export async function consultRequisition(customerId) {
    return consultRecord(requisitionRecordExistsByIdCustomer, 'la requisicion', customerId);
}

export async function consultRequisitionId(requisicionId) {
    return consultRecord(requisitionRecordExistsById, 'la requisicion', requisicionId);
}

export async function consultCostCenter(customerId, cityId) {
    return consultRecord(costCenterRecordExistsByIdCustomerIdCity, 'el centro de costo', customerId, cityId);
}

export async function consultGroup() {
    return consultRecord(groupRecordExistsByGroup, 'los grupos de conceptos');
}

export async function consultConcept(groupId) {
    return consultRecord(conceptRecordExistsByIdGroup, 'los conceptos', groupId);
}

export async function consultProfile(profileId) {
    return consultRecord(profileRecordExistsById, 'el perfil', profileId);
}

export async function consultApplyCall(reqId) {
    return consultRecord(applyCallRecordExistsByIdReq, 'aplicar convocatoria', reqId);
}

export async function consultApplyCallById(Id) {
    return consultRecord(applyCallRecordExistsById, 'aplicar convocatoria', Id);
}

export async function consultBaseValues() {
    return consultRecord(baseValuesByYear, 'los valores base');
}

export async function consultContractBenefit(reqId) {
    return consultRecord(contractBenefitRecordExistsByIdReq, 'los beneficios del contrato', reqId);
}

export async function consultContractBenefitByIdEntryOrderM(entryOrderMId) {
    return consultRecord(contractBenefitRecordExistsByIdEntryOrderM, 'los beneficios del contrato', entryOrderMId);
}

export async function consultEntryOrderM(entryOrderMId) {
    const responseEOM = await consultRecord(entryOrderMRecordExistsById, 'la orden de ingreso masiva', entryOrderMId);
    const responseEO = await consultRecord(entryOrderRecordExistsByIdMas, 'la orden de ingreso', responseEOM[0].id);
    responseEOM[0].id_requisicion = responseEO[0].id_requisicion;
    responseEOM[0].id_cliente = responseEO[0].id_cliente;
    responseEOM[0].id_ciudad = responseEO[0].id_ciudad;
    responseEOM[0].id_postulado = responseEO.map(item => item.id_postulado);
    return responseEOM;
}
