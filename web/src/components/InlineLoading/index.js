import React from 'react';
import './InlineLoading.css';

/**
 * Componente para mostrar um indicador de loading inline
 * @param {Object} props - Propriedades do componente
 * @param {string} props.message - Mensagem a ser exibida junto com o spinner
 * @param {string} props.size - Tamanho do spinner ('small', 'medium' ou 'large')
 */
const InlineLoading = ({ message = 'Carregando...', size = 'medium' }) => {
    return (
        <div className={`inline-loading-container size-${size}`}>
            <div className="inline-spinner"></div>
            {message && <span className="inline-loading-message">{message}</span>}
        </div>
    );
};

export default InlineLoading;