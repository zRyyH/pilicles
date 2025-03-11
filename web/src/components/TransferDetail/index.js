import React from 'react';
import { formatField } from '../../utils/formatters';
import styles from '../ResultSection/ResultSection.module.css';

function TransferDetail({ comprovante, transferencia, isValid }) {
    // Determina quais campos exibir
    const campos = [
        { id: 'data', label: 'Data' },
        { id: 'nome', label: 'Nome' },
        { id: 'valor', label: 'Valor' },
        { id: 'banco', label: 'Banco' }
    ];

    // Renderiza um campo com formatação
    const renderCampo = (campo, objeto, lado) => {
        const valor = objeto[campo.id] || '';
        const formattedValue = formatField(campo.id, valor);

        return (
            <div className={styles.transferCell}>
                <div className={styles.transferLabel}>{campo.label} {lado && `(${lado})`}</div>
                <div className={styles.transferValue}>{formattedValue}</div>
            </div>
        );
    };

    return (
        <div className={`${styles.transferDetail} ${isValid ? styles.valido : styles.invalido}`}>
            <div className={styles.transferHeader}>
                {isValid ? 'Registro Válido' : 'Registro Inválido'}
            </div>
            <div className={styles.transferBody}>
                {campos.map(campo => (
                    <div key={campo.id} className={styles.transferRow}>
                        {renderCampo(campo, comprovante, 'Comprovante')}
                        {renderCampo(campo, transferencia, 'Transferência')}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default TransferDetail;