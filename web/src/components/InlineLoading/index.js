import React from 'react';
import './InlineLoading.css';

/**
 * Componente aprimorado para indicação de carregamento inline
 * 
 * @param {Object} props - Propriedades do componente
 * @param {string} props.message - Mensagem exibida junto ao spinner
 * @param {string} props.size - Tamanho do spinner ('xs', 'small', 'medium', 'large', 'xl')
 * @param {string} props.theme - Tema de cores ('light', 'dark', 'primary', 'success', 'warning', 'transparent')
 * @param {string} props.variation - Variação do spinner ('default', 'pulse', 'dots')
 * @param {string} props.position - Posição da mensagem em relação ao spinner ('left', 'right', 'top', 'bottom')
 * @param {boolean} props.fadeIn - Se deve ter animação de aparecimento
 * @param {string} props.cursor - Cursor a ser exibido ('progress', 'wait', 'default')
 */
const InlineLoading = ({
    message = 'Carregando...',
    size = 'medium',
    theme = 'light',
    variation = 'default',
    position = 'right',
    fadeIn = true,
    cursor = 'progress'
}) => {
    // Verifica se é a variação dots (bolinhas)
    const isDots = variation === 'dots';

    // Classes CSS combinadas
    const containerClasses = [
        'inline-loading-container',
        `size-${size}`,
        `theme-${theme}`,
        `position-${position}`,
        fadeIn ? 'fade-in' : '',
        cursor ? `cursor-${cursor}` : '',
        variation !== 'default' ? `variation-${variation}` : ''
    ].filter(Boolean).join(' ');

    return (
        <div className={containerClasses}>
            <div className="loading-spinner-container">
                {isDots ? (
                    <>
                        <div className="loading-spinner dot-1"></div>
                        <div className="loading-spinner dot-2"></div>
                        <div className="loading-spinner dot-3"></div>
                    </>
                ) : (
                    <div className="loading-spinner"></div>
                )}
            </div>

            {message && <span className="inline-loading-message">{message}</span>}
        </div>
    );
};

/**
 * Componente de carregamento com tamanho extra pequeno
 */
InlineLoading.XSmall = (props) => <InlineLoading {...props} size="xs" />;

/**
 * Componente de carregamento com tamanho pequeno
 */
InlineLoading.Small = (props) => <InlineLoading {...props} size="small" />;

/**
 * Componente de carregamento com tamanho médio (padrão)
 */
InlineLoading.Medium = (props) => <InlineLoading {...props} size="medium" />;

/**
 * Componente de carregamento com tamanho grande
 */
InlineLoading.Large = (props) => <InlineLoading {...props} size="large" />;

/**
 * Componente de carregamento com tamanho extra grande
 */
InlineLoading.XLarge = (props) => <InlineLoading {...props} size="xl" />;

/**
 * Spinner sem texto, apenas com o indicador visual
 */
InlineLoading.Spinner = (props) => <InlineLoading {...props} message="" />;

/**
 * Spinner com estilo de pontos pulando
 */
InlineLoading.Dots = (props) => <InlineLoading {...props} variation="dots" />;

/**
 * Spinner para indicar sucesso
 */
InlineLoading.Success = (props) => <InlineLoading {...props} theme="success" />;

/**
 * Spinner para indicar alerta ou espera importante
 */
InlineLoading.Warning = (props) => <InlineLoading {...props} theme="warning" />;

/**
 * Exemplo de uso:
 * <InlineLoading message="Processando..." theme="primary" size="large" />
 * <InlineLoading.Dots message="Aguarde" />
 * <InlineLoading.Success message="Enviando dados" />
 */

export default InlineLoading;