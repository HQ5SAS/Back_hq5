// Formato a los campos fecha
export const formatDate = (dateIn) => {
    const date = new Date(dateIn);
    const optionDate = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return date.toLocaleDateString('en-GB', optionDate).replace(/ /g, '-');
};