/**
 * Converte uma data do formato DD/MM/YYYY para YYYY-MM-DD
 * @param {string} dataString - Data no formato DD/MM/YYYY
 * @returns {string} Data no formato YYYY-MM-DD
 */
function formatDateToDB(dataString) {
    if (!dataString) return null;

    const partes = dataString.split('/');
    if (partes.length !== 3) return dataString;

    return `${partes[2]}-${partes[1]}-${partes[0]}`;
}

module.exports = {
    formatDateToDB
};