import { formatName } from '../../Tools/string.js';
import { formatDate } from '../../Tools/date.js';
import PDFDocument from 'pdfkit-table';
import fs from 'fs';

// Calcular dias entre la fecha actual y la fecha de ingreso de los empleados
export const calculateDaysInfo = (employee, currentDate) => {
    const daysDifference = Math.floor((currentDate - employee.fecha_ingreso) / (1000 * 60 * 60 * 24));
    const daysRemaining = 365 - daysDifference;
    return { ...employee, daysDifference, daysRemaining };
};

// Formato para extraer (documento, nombre, fecha ingreso) de los empleados y formar un solo string
export const formatEmployeeForWhatsApp = (employee) => {
    const formattedDate = formatDate(employee.fecha_ingreso);
    const formattedNombre = formatName(employee.nombre);
    const formattedApellido = formatName(employee.apellido);
    return `${employee.documento} ${formattedNombre} ${formattedApellido} ${formattedDate}`;
};

// Formato para extraer (documento, nombre, fecha ingreso) de los empleados y formar una tabla dentro de un pdf
export const generateEmployeeTablePDF = (employees, outputPath) => {
    const pdfDoc = new PDFDocument({ margin: 50, size: 'A4' });
    pdfDoc.pipe(fs.createWriteStream(outputPath));

    pdfDoc.fontSize(16).text('Empresa', { align: 'center' });
    pdfDoc.moveDown(1.5);

    // Crear la tabla con encabezados
    const tableTitle = 'Empleados próximos a finalizar contrato';
    const tableSubtitle = 'La siguiente tabla presenta una recopilación de empleados cuyos contratos están próximos a concluir en un plazo de dos meses o menos';
    const tableHeaders = [
        { label: 'Documento', property: 'documento', valign: "center", headerAlign:"center", headerColor:"#5537AB", headerOpacity:0.5  },
        { label: 'Nombre', property: 'nombre', valign: "center", headerAlign:"center", headerColor:"#5537AB", headerOpacity:0.5 },
        { label: 'Fecha Ingreso', property: 'fecha_ingreso', valign: "center", headerAlign:"center", headerColor:"#5537AB", headerOpacity:0.5 },
    ];
    const tableRows = employees.map(employee => [
        `${employee.documento}`,
        `${formatName(employee.nombre)} ${formatName(employee.apellido)}`,
        `${formatDate(employee.fecha_ingreso)}`
    ]);

    const table = {
        title: tableTitle,
        subtitle: tableSubtitle,
        headers: tableHeaders,
        rows: tableRows
    };

    const tableStyle = {
        prepareHeader: () => pdfDoc.font('Helvetica-Bold').fontSize(12),
        prepareRow: () => pdfDoc.font('Helvetica-Bold').fontSize(9),
    };
      
    pdfDoc.table(table, tableStyle);

    pdfDoc.end();
    console.log(`PDF generado exitosamente en ${outputPath}.`);
};