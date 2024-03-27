// Función para obtener el nombre del mes a partir de su número
export const getMonthName = (month) => {
    const months = [ "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre" ];
    return months[month];
}

// Función para obtener una lista de objetos representando los años y meses
export const getYearMonthList = (months) => {
    const currentDate = new Date();
    const yearMonthList = [];
  
    for (let i = 0; i < months; i++) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
        const year = date.getFullYear();
        const month = date.getMonth();
        const monthName = getMonthName(month);
        yearMonthList.push({ year, month: monthName });
    }
  
    return yearMonthList;
}
