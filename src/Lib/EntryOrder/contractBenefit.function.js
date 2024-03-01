import { consultBaseValues } from './entryOrderQuery.function.js';

// Funcion para generar un objeto en beneficios del contrato para el concepto de subsidio de transporte legal
export async function getLegalTransportSubsidy () {
    const [{ subsidio_transporte: subsidyTransport }] = await consultBaseValues();

    return {
        grupo: { id: "3960020000008511725" },
        concepto: { id: "3960020000007732275" },
        valor: parseInt(subsidyTransport),
        metodologia_pago: "Proporcional dias laborados"
    };
}