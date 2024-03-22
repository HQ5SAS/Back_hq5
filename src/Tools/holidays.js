// Objeto global para almacenar información sobre meses y días festivos
var holidaysColombian = {
    2024: {
        1: [1, 8],
        3: [25, 28, 29],
        5: [1, 13],
        6: [3, 10],
        7: [1, 20],
        8: [7, 19],
        10: [14],
        11: [4, 11],
        12: [25]
    },
    2025: {
        1: [1, 6],
        3: [24],
        4: [17, 18],
        5: [1],
        6: [2, 23, 30],
        7: [20],
        8: [7, 18],
        10: [13],
        11: [3, 17],
        12: [8, 25]
    },
    2026: {
        1: [1, 12],
        3: [23],
        4: [2, 3],
        5: [1, 18],
        6: [8, 15, 29],
        7: [20],
        8: [7, 17],
        10: [12],
        11: [2, 16],
        12: [8, 25]
    },
};

// Función para verificar si una fecha es festiva
export const isHoliday = (year, month, day) => {
    var year = holidaysColombian[year];
    if (year) {
        var days = year[month];
        if (days && days.includes(parseInt(day, 10))) {
            return true;
        }
    }
    return false;
}
