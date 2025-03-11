import React from 'react';
import './NotificationMessage.css';

/**
 * Componente para exibir mensagens de notificação (sucesso, erro, info)
 * @param {Object} props - Propriedades do componente
 * @param {string} props.message - Texto da mensagem
 * @param {string} props.type - Tipo da mensagem (success, error, info)
 * @param {function} props.onClose - Função para fechar a notificação (opcional)
 * @param {number} props.autoCloseTime - Tempo em ms para fechar automaticamente (opcional)
 */
const NotificationMessage = ({
    message,
    type = 'info',
    onClose,
    autoCloseTime
}) => {
    React.useEffect(() => {
        if (autoCloseTime && onClose) {
            const timer = setTimeout(() => {
                onClose();
            }, autoCloseTime);

            return () => clearTimeout(timer);
        }
    }, [autoCloseTime, onClose]);

    if (!message) return null;

    return (
        <div className={`notification-message ${type}`}>
            <span className="message-text">{message}</span>
            {onClose && (
                <button
                    className="close-button"
                    onClick={onClose}
                    aria-label="Fechar notificação"
                >
                    &times;
                </button>
            )}
        </div>
    );
};

export default NotificationMessage;