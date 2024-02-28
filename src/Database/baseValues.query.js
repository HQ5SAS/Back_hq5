import { dbConnection } from './connection.js';

// Función para extraer el valor del salario minimo legal vigente y el auxilio de transporte por año de la tabla valores_base_anuales
export const baseValuesByYear = async () => {
    try {
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const { results } = await dbConnection.query(`
            SELECT 
                salario_base AS salario, 
                auxilio_transporte AS subsidio_transporte 
            FROM 
                valores_base_anuales 
            WHERE 
                año = ? 
            LIMIT 
                1
        `, [currentYear]);
        
        return results;

    } catch (error) {
        console.error('Error en la consulta de: baseValuesByYear', error);
        throw error;
    }
};
