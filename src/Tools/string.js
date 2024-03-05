// Formato a los campos string (Primera en mayuscula resto en minuscula)
export const formatName = (name) => {
    return `${name.charAt(0).toUpperCase()}${name.slice(1).toLowerCase()}`;
};