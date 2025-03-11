import axios from 'axios';
import config from '../config';

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
    // Enviar arquivos para análise
    enviarArquivos: async (formData) => {
        try {
            const response = await uploadClient.post('/carregar', formData);
            return response.data;
        } catch (error) {
            console.error('Erro ao enviar arquivos para análise:', error);
            throw error;
        }
    }
};

export default {
    comprovantesService,
    uploadService
};