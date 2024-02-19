import { natureRecordExistsByIdCustomer } from '../../Database/nature.query.js';
import { projectRecordExistsByIdCustomer } from '../../Database/project.query.js';
import { businessLineRecordExistsByIdCustomer } from '../../Database/businessLine.quey.js';
import { areaRecordExistsByIdCustomer } from '../../Database/area.query.js';
import { subCostCenterRecordExistsByIdCustomer } from '../../Database/subCostCenter.query.js';
import { costCenterRecordExistsByIdCustomer } from '../../Database/costCenter.query.js';
import { groupRecordExistsByGroup } from '../../Database/group.query.js';
import { conceptRecordExistsByIdGroup } from '../../Database/concept.query.js';
import { createErrorResponse } from '../../Tools/utils.js';

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

export async function consultCostCenter(customerId) {
    return consultRecordByIdCustomer(costCenterRecordExistsByIdCustomer, 'el centro de costo', customerId);
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