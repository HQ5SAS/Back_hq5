import { natureRecordExistsByIdCustomer } from '../../Database/nature.query.js';
import { projectRecordExistsByIdCustomer } from '../../Database/project.query.js';
import { businessLineRecordExistsByIdCustomer } from '../../Database/businessLine.quey.js';
import { areaRecordExistsByIdCustomer } from '../../Database/area.query.js';
import { subCenterCostRecordExistsByIdCustomer } from '../../Database/subCostCenter.query.js';
import { createErrorResponse } from '../../Tools/utils.js';

export async function consultNature(customerId) {
    try {
        const response = await natureRecordExistsByIdCustomer(customerId);
        return response;

    } catch (error) {
        console.error('Error al obtener la naturaleza del centro de costo por id cliente:', error);
        throw createErrorResponse('Error al obtener la naturaleza del centro de costo por id cliente', 400);
    }
}

export async function consultProject(customerId) {
    try {
        const response = await projectRecordExistsByIdCustomer(customerId);
        return response;

    } catch (error) {
        console.error('Error al obtener el project por id cliente:', error);
        throw createErrorResponse('Error al obtener el project por id cliente', 400);
    }
}

export async function consultBusinessLine(customerId) {
    try {
        const response = await businessLineRecordExistsByIdCustomer(customerId);
        return response;

    } catch (error) {
        console.error('Error al obtener la linea de negocio por id cliente:', error);
        throw createErrorResponse('Error al obtener la linea de negocio por id cliente', 400);
    }
}

export async function consultArea(customerId) {
    try {
        const response = await areaRecordExistsByIdCustomer(customerId);
        return response;

    } catch (error) {
        console.error('Error al obtener el area por id cliente:', error);
        throw createErrorResponse('Error al obtener el area por id cliente', 400);
    }
}

export async function consultSubCenterCost(customerId) {
    try {
        const response = await subCenterCostRecordExistsByIdCustomer(customerId);
        return response;

    } catch (error) {
        console.error('Error al obtener el sub centro de costo por id cliente:', error);
        throw createErrorResponse('Error al obtener el sub centro de costo por id cliente', 400);
    }
}