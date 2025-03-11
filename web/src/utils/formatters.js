/**
 * Remove quebras de linha e garante que o valor seja string
 */
export const sanitize = (value) => {
    if (value == null) return "";
    if (typeof value !== 'string') value = String(value);
    return value.replace(/(\r\n|\n|\r)/gm, ' ');
};

/**
 * Formata campos conforme regras específicas:
 * - Se campo for "nome" ou "data" e estiver vazio, retorna "Desconhecido"
 * - Se campo for "valor" e for 0, retorna "Desconhecido"
 */
export const formatField = (field, value) => {
    const cleanedValue = sanitize(value);

    if ((field === 'nome' || field === 'data') && cleanedValue.trim() === "") {
        return "Desconhecido";
    }

    if (field === 'valor' && (cleanedValue.trim() === "0" || cleanedValue.trim() === "0.0")) {
        return "Desconhecido";
    }

    if (field === 'valor' && cleanedValue.trim() !== "" && cleanedValue !== "Desconhecido") {
        // Converter para número e formatar como moeda brasileira
        const numericValue = parseFloat(cleanedValue.replace(/[^\d.-]/g, ''));
        if (!isNaN(numericValue)) {
            return formatCurrency(numericValue);
        }
    }

    return cleanedValue;
};

/**
 * Formata um valor numérico para o formato de moeda brasileira (R$)
 */
export const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(value);
};

/**
 * Extrai um valor numérico a partir de diferentes formatos de dados
 */
export const extractNumericValue = (value) => {
    // Caso não exista valor
    if (value === null || value === undefined) return 0;

    // Caso seja um número diretamente
    if (typeof value === 'number') return value;

    // Caso seja um objeto com propriedade valor
    if (typeof value === 'object' && value && value.valor !== undefined) {
        const rawValue = value.valor;

        // Se valor for um número diretamente
        if (typeof rawValue === 'number') return rawValue;

        // Se valor for uma string, converter para número
        if (typeof rawValue === 'string') {
            const cleanValue = sanitize(rawValue).replace(/[^\d.-]/g, '');
            const numericValue = parseFloat(cleanValue);
            return !isNaN(numericValue) ? numericValue : 0;
        }
    }

    // Caso seja uma string diretamente
    if (typeof value === 'string') {
        const cleanValue = sanitize(value).replace(/[^\d.-]/g, '');
        const numericValue = parseFloat(cleanValue);
        return !isNaN(numericValue) ? numericValue : 0;
    }

    // Para outros casos não tratados
    return 0;
};

/**
 * Coleta valores recursivamente de um objeto ou array
 */
export const collectValues = (obj, depth = 0, maxDepth = 3) => {
    if (depth >= maxDepth) return [];
    if (!obj) return [];

    let values = [];

    // Caso seja um array
    if (Array.isArray(obj)) {
        obj.forEach(item => {
            if (typeof item === 'number') {
                values.push(item);
            } else if (typeof item === 'string') {
                const numValue = extractNumericValue(item);
                if (numValue > 0) values.push(numValue);
            } else if (typeof item === 'object' && item) {
                // Se tiver propriedade valor
                if (item.valor !== undefined) {
                    const numValue = extractNumericValue(item);
                    if (numValue > 0) values.push(numValue);
                } else {
                    // Procurar valores recursivamente
                    values = values.concat(collectValues(item, depth + 1, maxDepth));
                }
            }
        });
    }
    // Caso seja um objeto
    else if (typeof obj === 'object') {
        // Verificar se tem propriedade valor diretamente
        if (obj.valor !== undefined) {
            const numValue = extractNumericValue(obj);
            if (numValue > 0) values.push(numValue);
        }
        // Procurar em cada propriedade
        else {
            Object.values(obj).forEach(val => {
                if (typeof val === 'number') {
                    values.push(val);
                } else if (typeof val === 'string') {
                    const numValue = extractNumericValue(val);
                    if (numValue > 0) values.push(numValue);
                } else if (typeof val === 'object' && val) {
                    values = values.concat(collectValues(val, depth + 1, maxDepth));
                }
            });
        }
    }

    return values;
};

/**
 * Calcula os totais para registros válidos e inválidos
 */
export const calculateTotals = (validos, invalidos) => {
    let totalValidos = 0;
    let totalInvalidos = 0;

    // Processa registros válidos
    validos.forEach(registro => {
        // Usa comprovantes para calcular o total
        if (registro && registro.comprovante) {
            const valores = collectValues(registro.comprovante);
            const total = valores.reduce((sum, val) => sum + val, 0);
            totalValidos += total;
        }
    });

    // Processa registros inválidos
    invalidos.forEach(registro => {
        // Usa comprovantes para calcular o total
        if (registro && registro.comprovante) {
            const valores = collectValues(registro.comprovante);
            const total = valores.reduce((sum, val) => sum + val, 0);
            totalInvalidos += total;
        }
    });

    return {
        totalValidos,
        totalInvalidos
    };
};

/**
 * Unifica comprovantes e transferências em pares
 */
export const mergeComprovantesTransferencias = (comprovanteObj, transferenciaObj) => {
    const comprovantes = Object.values(comprovanteObj || {});

    let transferencias = [];
    if (transferenciaObj && typeof transferenciaObj === 'object') {
        transferencias = Object.values(transferenciaObj).filter(
            (val) => val && typeof val === 'object'
        );
    }

    const maxLen = Math.max(comprovantes.length, transferencias.length);
    const merged = [];

    for (let i = 0; i < maxLen; i++) {
        merged.push({
            comprovante: comprovantes[i] || {},
            transferencia: transferencias[i] || {},
        });
    }

    return merged;
};