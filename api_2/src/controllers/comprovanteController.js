/**
 * Controller para processar comprovantes
 */
const comprovanteService = require('../services/comprovanteService');

/**
 * Recebe e processa os comprovantes
 * @param {Object} req - Requisição HTTP
 * @param {Object} res - Resposta HTTP
 * @param {Function} next - Próximo middleware
 */
const receberComprovantes = async (req, res, next) => {
    try {
        const resultado = await comprovanteService.processarComprovantes(req.body);

        // Ajuste do código de status dependendo se houve duplicatas
        const statusCode = resultado.duplicadosIgnorados > 0 ? 207 : 201;

        return res.status(statusCode).json({
            message: resultado.duplicadosIgnorados > 0
                ? 'Comprovantes processados com sucesso, alguns foram ignorados por serem duplicados'
                : 'Comprovantes processados com sucesso',
            ...resultado
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Busca comprovantes pelo nome (busca parcial)
 * @param {Object} req - Requisição HTTP
 * @param {Object} res - Resposta HTTP
 * @param {Function} next - Próximo middleware
 */
const buscarPorNome = async (req, res, next) => {
    try {
        const { nome } = req.query;

        if (!nome) {
            return res.status(400).json({
                error: 'Parâmetro de busca inválido',
                message: 'É necessário informar um nome para busca'
            });
        }

        console.log('Buscando comprovantes por nome:', nome);

        const comprovantes = await comprovanteService.buscarPorNome(nome);

        return res.status(200).json({
            message: comprovantes.length > 0
                ? `${comprovantes.length} comprovante(s) encontrado(s)`
                : 'Nenhum comprovante encontrado',
            total: comprovantes.length,
            comprovantes
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Atualiza o status de um comprovante (válido/inválido)
 * @param {Object} req - Requisição HTTP
 * @param {Object} res - Resposta HTTP
 * @param {Function} next - Próximo middleware
 */
const atualizarStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({
                error: 'Dados inválidos',
                message: 'O status do comprovante deve ser informado'
            });
        }

        if (!['valido', 'invalido'].includes(status)) {
            return res.status(400).json({
                error: 'Dados inválidos',
                message: 'O status deve ser "valido" ou "invalido"'
            });
        }

        try {
            const comprovante = await comprovanteService.atualizarStatusComprovante(id, status);

            return res.status(200).json({
                message: `Comprovante ${status === 'valido' ? 'validado' : 'invalidado'} com sucesso`,
                comprovante
            });
        } catch (error) {
            if (error.message === 'Comprovante não encontrado') {
                return res.status(404).json({
                    error: 'Não encontrado',
                    message: error.message
                });
            }
            throw error;
        }
    } catch (error) {
        next(error);
    }
};

/**
 * Exclui um comprovante
 * @param {Object} req - Requisição HTTP
 * @param {Object} res - Resposta HTTP
 * @param {Function} next - Próximo middleware
 */
const excluir = async (req, res, next) => {
    try {
        const { id } = req.params;

        try {
            await comprovanteService.excluirComprovante(id);

            return res.status(200).json({
                message: 'Comprovante excluído com sucesso'
            });
        } catch (error) {
            if (error.message === 'Comprovante não encontrado') {
                return res.status(404).json({
                    error: 'Não encontrado',
                    message: error.message
                });
            }
            throw error;
        }
    } catch (error) {
        next(error);
    }
};

module.exports = {
    receberComprovantes,
    buscarPorNome,
    atualizarStatus,
    excluir
};