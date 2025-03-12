import axios from 'axios';
import config from '../config';

// Identificador único para requisições
let currentRequestId = 0;

// Configuração base para o axios
const apiClient = axios.create({
    baseURL: config.api.baseUrl,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: config.api.timeout,
});

// Configuração para o serviço de upload
const uploadClient = axios.create({
    baseURL: config.api.uploadUrl,
    timeout: config.api.uploadTimeout,
});

// Controle de requisições ativas
let activeUploadController = null;

// Adicionando identificadores para debugging
apiClient.interceptors.request.use(request => {
    const requestId = ++currentRequestId;
    request.headers['X-Request-ID'] = `api-${requestId}`;
    return request;
});

uploadClient.interceptors.request.use(request => {
    const requestId = ++currentRequestId;
    request.headers['X-Request-ID'] = `upload-${requestId}`;
    return request;
});

// Serviços para comprovantes
export const comprovantesService = {
    // Buscar comprovantes por nome do cliente
    buscarPorNome: async (nome) => {
        try {
            const response = await apiClient.get(`/comprovantes/buscar?nome=${encodeURIComponent(nome)}`);
            return response.data;
        } catch (error) {
            console.error('Erro ao buscar comprovantes:', error);
            throw error;
        }
    },

    // Excluir um comprovante por ID
    excluir: async (id) => {
        try {
            const response = await apiClient.delete(`/comprovantes/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Erro ao excluir comprovante #${id}:`, error);
            throw error;
        }
    },

    // Validar um comprovante por ID
    validar: async (id) => {
        try {
            const response = await apiClient.patch(`/comprovantes/${id}/status`, {
                status: "valido"
            });
            return response.data;
        } catch (error) {
            console.error(`Erro ao validar comprovante #${id}:`, error);
            throw error;
        }
    },

    // Efetivar alterações nos comprovantes
    efetivarAlteracoes: async (dadosEditados) => {
        try {
            const response = await apiClient.post('/comprovantes', dadosEditados);

            if (!response.data) {
                throw new Error('Resposta vazia ao efetivar alterações');
            }

            return response.data;
        } catch (error) {
            console.error('Erro ao efetivar alterações:', error);
            throw error;
        }
    }
};

// Serviços para upload e análise de arquivos
export const uploadService = {
    // Enviar arquivos para análise - com cancelamento de requisição anterior
    enviarArquivos: async (formData) => {
        // Cancelar qualquer requisição ativa
        if (activeUploadController) {
            activeUploadController.abort();
        }

        // Criar novo controlador para esta requisição
        const controller = new AbortController();
        activeUploadController = controller;

        try {
            const response = await uploadClient.post('/carregar', formData, {
                signal: controller.signal
            });

            // Limpar referência após conclusão bem-sucedida
            if (activeUploadController === controller) {
                activeUploadController = null;
            }

            return response.data;
        } catch (error) {
            // Ignorar erros de abortamento
            if (error.name === 'AbortError' || error.message === 'canceled') {
                throw new Error('Requisição cancelada');
            }

            // Limpar referência em caso de erro
            if (activeUploadController === controller) {
                activeUploadController = null;
            }

            console.error('Erro ao enviar arquivos para análise:', error);
            throw error;
        }
    }
};

export default {
    comprovantesService,
    uploadService
};