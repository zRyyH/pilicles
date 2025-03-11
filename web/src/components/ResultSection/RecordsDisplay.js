import React from 'react';
import EditableTransferDetail from '../EditableTransferDetail';
import { Info } from 'lucide-react';
import styles from './ResultSection.module.css';

function RecordsDisplay({ registros, isValid, onComprovanteChange, onTransferenciaChange }) {
    if (registros.length === 0) {
        return (
            <div className={styles.emptyStateTab}>
                <Info size={24} className={styles.emptyIcon} />
                <p>Nenhum registro {isValid ? "válido" : "inválido"} encontrado</p>
            </div>
        );
    }

    return (
        <div className={styles.section}>
            {registros.map((registro, index) => {
                const comprovanteId = registro.comprovante ? Object.keys(registro.comprovante)[0] : null;

                let transferenciaId = null;
                let transferenciaObj = null;

                if (registro.transferencia && typeof registro.transferencia === 'object' && registro.transferencia !== 'Desconhecido') {
                    transferenciaId = Object.keys(registro.transferencia).find(
                        key => key !== 'banco' && key !== 'confianca'
                    );

                    if (transferenciaId) {
                        transferenciaObj = registro.transferencia[transferenciaId];
                    }
                }

                return (
                    <EditableTransferDetail
                        key={index}
                        comprovante={comprovanteId ? registro.comprovante[comprovanteId] : null}
                        transferencia={transferenciaObj}
                        isValid={isValid}
                        comprovanteId={comprovanteId}
                        transferenciaId={transferenciaId}
                        registroIndex={index}
                        onComprovanteChange={onComprovanteChange}
                        onTransferenciaChange={onTransferenciaChange}
                    />
                );
            })}
        </div>
    );
}

export default RecordsDisplay;