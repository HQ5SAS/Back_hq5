import { natureRecordExistsByIdCustomer } from '../../Database/nature.query.js';
import { projectRecordExistsByIdCustomer } from '../../Database/project.query.js';
import { businessLineRecordExistsByIdCustomer } from '../../Database/businessLine.quey.js';
import { areaRecordExistsByIdCustomer } from '../../Database/area.query.js';
import { subCostCenterRecordExistsByIdCustomer } from '../../Database/subCostCenter.query.js';
import { costCenterRecordExistsByIdCustomerIdCity } from '../../Database/costCenter.query.js';
import { groupRecordExistsByGroup } from '../../Database/group.query.js';
import { conceptRecordExistsByIdGroup } from '../../Database/concept.query.js';
import { profileRecordExistsById } from '../../Database/profile.query.js';
import { createErrorResponse } from '../../Tools/utils.js';
import { applyCallRecordExistsByIdReq } from '../../Database/applyCall.query.js';
import { requisitionRecordExistsByIdCustomer } from '../../Database/requisition.query.js';
import { baseValuesByYear } from '../../Database/baseValues.query.js';
import { contractBenefitRecordExistsByIdReq } from '../../Database/contractBenefit.query.js';

async function consultRecordByIdCustomer(recordFunction, recordType, customerId) {
    try {
        const response = await recordFunction(customerId);
        return response;
  
    } catch (error) {
        console.error(`Error al obtener ${recordType} por id cliente:`, error);
        throw createErrorResponse(`Error al obtener ${recordType} por id cliente`, 400);
    }
}
  
export async function consultNature(customerId) {
    return consultRecordByIdCustomer(natureRecordExistsByIdCustomer, 'la naturaleza del centro de costo', customerId);
}

export async function consultProject(customerId) {
    return consultRecordByIdCustomer(projectRecordExistsByIdCustomer, 'el project', customerId);
}

export async function consultBusinessLine(customerId) {
    return consultRecordByIdCustomer(businessLineRecordExistsByIdCustomer, 'la línea de negocio', customerId);
}

export async function consultArea(customerId) {
    return consultRecordByIdCustomer(areaRecordExistsByIdCustomer, 'el área', customerId);
}

export async function consultSubCenterCost(customerId) {
    return consultRecordByIdCustomer(subCostCenterRecordExistsByIdCustomer, 'el sub centro de costo', customerId);
}

export async function consultRequisition(customerId) {
    return consultRecordByIdCustomer(requisitionRecordExistsByIdCustomer, 'la requisicion', customerId);
}

export async function consultCostCenter(customerId, cityId) {
    try {
        const response = await costCenterRecordExistsByIdCustomerIdCity(customerId, cityId);
        return response;
  
    } catch (error) {
        console.error(`Error al obtener el centro de costo por id cliente, id ciudad:`, error);
        throw createErrorResponse(`Error al obtener el centro de costo por id cliente, id ciudad`, 400);
    }
}

export async function consultGroup() {
    try {
        const response = await groupRecordExistsByGroup();
        return response;
  
    } catch (error) {
        console.error('Error al obtener los grupos de conceptos', error);
        throw createErrorResponse('Error al obtener los grupos de conceptos', 400);
    }
}

export async function consultConcept(groupId) {
    try {
        const response = await conceptRecordExistsByIdGroup(groupId);
        return response;

    } catch (error) {
        console.error('Error al obtener los conceptos por id grupo', error);
        throw createErrorResponse('Error al obtener los conceptos por id grupo', 400);
    }
}

export async function consultProfile(profileId) {
    try {
        const response = await profileRecordExistsById(profileId);
        return response;

    } catch (error) {
        console.error('Error al obtener el perfil por id perfil', error);
        throw createErrorResponse('Error al obtener el perfil por id perfil', 400);
    }
}

export async function consultApplyCall(reqId) {
    try {
        const response = await applyCallRecordExistsByIdReq(reqId);
        return response;

    } catch (error) {
        console.error('Error al obtener aplicar convocatoria por id requisicion', error);
        throw createErrorResponse('Error al obtener aplicar convocatoria por id requisicion', 400);
    }
}

export async function consultBaseValues() {
    try {
        const response = await baseValuesByYear();
        return response;

    } catch (error) {
        console.error('Error al obtener los valores base', error);
        throw createErrorResponse('Error al obtener los valores base', 400);
    }
}

export async function consultContractBenefit(reqId) {
    try {
        const response = await contractBenefitRecordExistsByIdReq(reqId);
        return response;

    } catch (error) {
        console.error('Error al obtener los beneficios del contrato por id requisicion', error);
        throw createErrorResponse('Error al obtener los beneficios del contrato por id requisicion', 400);
    }
}