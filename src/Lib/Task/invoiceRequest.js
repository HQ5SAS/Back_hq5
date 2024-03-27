import { getYearMonthList } from '../../Tools/monthsYears.js';  

// Funcion para obtener un mapa y un string con los meses con su respectivo año en un indice
export const processYearMonthList = (yearMonthList) => {
    const mapData = {};
    let messageData = '';
  
    yearMonthList.forEach((item, index) => {
        const indexKey = (index + 1).toString();
        const { month, year } = item;
        mapData[indexKey] = `${month} ${year}`;
        messageData += `${indexKey}️⃣ ${month} ${year}\n`;
    });
  
    return { mapData, messageData };
}

// Funcion auxiliar para ejecutar la funcion de generacion de mapa y string
export const processYearMonthObj = async () => {
    return processYearMonthList(getYearMonthList(6));
}
