import React from 'react';
import './LoadingOverlay.css';

/**
 * Componente que exibe um overlay de carregamento em tela cheia
 * @param {Object} props - Propriedades do componente
 * @param {string} props.message - Mensagem a ser exibida durante o carregamento
 */
const LoadingOverlay = ({ message = 'Carregando...' }) => {
    return (
        <div className="loading-overlay">
            <div className="loading-content">
                <div className="loading-spinner"></div>
                <p className="loading-message">{message}</p>
            </div>
        </div>
    );
};

export default LoadingOverlay;