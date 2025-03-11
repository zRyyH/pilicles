/**
 * Arquivo de configuração centralizada da aplicação
 */

// Configurações de ambiente
const ENV = process.env.NODE_ENV || 'development';

// Configurações de API por ambiente
const API_CONFIG = {
    development: {
        baseUrl: 'https://pix1api.awpsoft.com.br/api',
        uploadUrl: 'https://pix2api.awpsoft.com.br',
        timeout: 600000,
        uploadTimeout: 600000
    },
    production: {
        baseUrl: '/api',
        uploadUrl: '/upload',
        timeout: 600000,
        uploadTimeout: 600000
    },
    test: {
        baseUrl: 'http://localhost:4000/api',
        uploadUrl: 'http://localhost:8000',
        timeout: 600000,
        uploadTimeout: 600000
    }
};

// Configurações de relatórios PDF
const PDF_CONFIG = {
    defaultColors: {
        primary: [41, 128, 185],
        secondary: [52, 73, 94],
        success: [39, 174, 96],
        danger: [192, 57, 43],
        light: [236, 240, 241]
    },
    pageSize: 'a4',
    orientation: 'landscape',
    defaultFileName: 'relatorio-validacao.pdf'
};

// Configurações de formatação
const FORMAT_CONFIG = {
    dateFormat: 'pt-BR',
    currencyFormat: {
        style: 'currency',
        currency: 'BRL'
    }
};

// Exportar configurações
export default {
    env: ENV,
    api: API_CONFIG[ENV],
    pdf: PDF_CONFIG,
    format: FORMAT_CONFIG
};