const Comprovante = require('../models/Comprovante');
const { formatDateToDB } = require('../utils/dateFormatter');
const { Op } = require('sequelize');

/**
 * Verifica se um comprovante já existe no banco de dados
 * @param {Object} comprovante - Dados do comprovante
 * @returns {Promise<boolean>} - true se já existe, false caso contrário
 */
async function verificarDuplicata(comprovante) {
    const dataFormatada = formatDateToDB(comprovante.data);

    const comprovanteExistente = await Comprovante.findOne({
        where: {
            nome: comprovante.nome,
            valor: comprovante.valor,
            data: dataFormatada,
            banco: comprovante.banco
        }
    });

    return !!comprovanteExistente;
}

/**
 * Processa os comprovantes recebidos e os salva no banco de dados
 * @param {Object} data - Dados dos comprovantes
 * @returns {Object} Resultado do processamento
 */
async function processarComprovantes(data) {
    const todosComprovantes = [];
    const duplicados = [];

    // Processar comprovantes válidos
    if (data.validos && data.validos.length > 0) {
        for (const item of data.validos) {
            const comprovanteKey = Object.keys(item.comprovante)[0];
            const comprovante = item.comprovante[comprovanteKey];

            // Verificar se o comprovante já existe
            const isDuplicado = await verificarDuplicata(comprovante);

            if (isDuplicado) {
                duplicados.push({
                    ...comprovante,
                    status: 'valido'
                });
                continue;
            }

            todosComprovantes.push({
                nome: comprovante.nome,
                valor: comprovante.valor,
                data: formatDateToDB(comprovante.data),
                banco: comprovante.banco,
                status: 'valido'
            });
        }
    }

    // Processar comprovantes inválidos
    if (data.invalidos && data.invalidos.length > 0) {
        for (const item of data.invalidos) {
            const comprovanteKey = Object.keys(item.comprovante)[0];
            const comprovante = item.comprovante[comprovanteKey];

            // Verificar se o comprovante já existe
            const isDuplicado = await verificarDuplicata(comprovante);

            if (isDuplicado) {
                duplicados.push({
                    ...comprovante,
                    status: 'invalido'
                });
                continue;
            }

            todosComprovantes.push({
                nome: comprovante.nome,
                valor: comprovante.valor,
                data: formatDateToDB(comprovante.data),
                banco: comprovante.banco,
                status: 'invalido'
            });
        }
    }

    // Salvar todos os comprovantes não duplicados no banco de dados
    let comprovantesInseridos = [];
    if (todosComprovantes.length > 0) {
        try {
            comprovantesInseridos = await Comprovante.bulkCreate(todosComprovantes, {
                // Essa opção garante que não serão inseridos duplicados
                ignoreDuplicates: true
            });
        } catch (error) {
            console.error('Erro ao inserir comprovantes:', error.message);
            // Se ocorrer erro de duplicata da constraint única, 
            // ainda retornamos informações úteis
            if (error.name === 'SequelizeUniqueConstraintError') {
                // Continua a execução para retornar estatísticas
            } else {
                throw error; // Outro tipo de erro é propagado
            }
        }
    }

    return {
        totalProcessados: comprovantesInseridos.length,
        validosProcessados: data.validos ?
            data.validos.length - duplicados.filter(d => d.status === 'valido').length : 0,
        invalidosProcessados: data.invalidos ?
            data.invalidos.length - duplicados.filter(d => d.status === 'invalido').length : 0,
        duplicadosIgnorados: duplicados.length,
        detalheDuplicados: duplicados.length > 0 ? duplicados : undefined
    };
}

/**
 * Busca comprovantes pelo nome (busca parcial)
 * @param {string} nome - Nome ou parte do nome a ser buscado
 * @returns {Promise<Array>} Lista de comprovantes encontrados
 */
async function buscarPorNome(nome) {
    if (!nome) {
        throw new Error('Nome de busca não informado');
    }

    const comprovantes = await Comprovante.findAll({
        where: {
            nome: {
                [Op.like]: `%${nome}%`
            }
        },
        order: [['data', 'DESC']]
    });

    return comprovantes;
}

/**
 * Atualiza o status de um comprovante (válido/inválido)
 * @param {number} id - ID do comprovante
 * @param {string} status - Novo status ('valido' ou 'invalido')
 * @returns {Promise<Object>} Comprovante atualizado
 */
async function atualizarStatusComprovante(id, status) {
    if (!id) {
        throw new Error('ID do comprovante não informado');
    }

    if (!status || !['valido', 'invalido'].includes(status)) {
        throw new Error('Status inválido. Deve ser "valido" ou "invalido"');
    }

    const comprovante = await Comprovante.findByPk(id);

    if (!comprovante) {
        throw new Error('Comprovante não encontrado');
    }

    comprovante.status = status;
    await comprovante.save();

    return comprovante;
}

/**
 * Exclui um comprovante
 * @param {number} id - ID do comprovante
 * @returns {Promise<boolean>} true se excluído com sucesso
 */
async function excluirComprovante(id) {
    if (!id) {
        throw new Error('ID do comprovante não informado');
    }

    const comprovante = await Comprovante.findByPk(id);

    if (!comprovante) {
        throw new Error('Comprovante não encontrado');
    }

    await comprovante.destroy();
    return true;
}

module.exports = {
    processarComprovantes,
    verificarDuplicata,
    buscarPorNome,
    atualizarStatusComprovante,
    excluirComprovante
};