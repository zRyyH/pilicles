import React, { useState, useCallback } from 'react';
import EditableTransferDetail from '../EditableTransferDetail';
import { Info, Search } from 'lucide-react';
import styles from './ResultSection.module.css';

function RecordsDisplay({ registros, isValid, onComprovanteChange, onTransferenciaChange }) {
    // Estado para o termo de pesquisa
    const [searchTerm, setSearchTerm] = useState('');
    const [fadeVisible, setFadeVisible] = useState(true);

    // Handler para atualização do termo de pesquisa
    const handleSearchChange = useCallback((e) => {
        setFadeVisible(false);
        setSearchTerm(e.target.value);

        // Simple fade transition
        setTimeout(() => {
            setFadeVisible(true);
        }, 300);
    }, []);

    // Filtrar os registros baseado no termo de pesquisa
    const filteredRegistros = registros.filter(registro => {
        // Verificar se há um comprovante com nome
        const comprovanteId = registro.comprovante ? Object.keys(registro.comprovante)[0] : null;
        const comprovanteNome = comprovanteId && registro.comprovante[comprovanteId].nome
            ? registro.comprovante[comprovanteId].nome.toLowerCase()
            : '';

        // Verificar se há uma transferência com nome
        let transferenciaNome = '';
        if (registro.transferencia && typeof registro.transferencia === 'object' && registro.transferencia !== 'Desconhecido') {
            const transferenciaId = Object.keys(registro.transferencia).find(
                key => key !== 'banco' && key !== 'confianca'
            );

            if (transferenciaId && registro.transferencia[transferenciaId] && registro.transferencia[transferenciaId].nome) {
                transferenciaNome = registro.transferencia[transferenciaId].nome.toLowerCase();
            }
        }

        // Retornar true se o termo de pesquisa existir em qualquer um dos nomes
        const term = searchTerm.toLowerCase();
        return comprovanteNome.includes(term) || transferenciaNome.includes(term);
    });

    if (registros.length === 0) {
        return (
            <div className={styles.emptyStateTab}>
                <Info size={24} className={styles.emptyIcon} />
                <p>Nenhum registro {isValid ? "válido" : "inválido"} encontrado</p>
            </div>
        );
    }

    return (
        <div className={styles.section} style={{ height: 'auto', maxHeight: 'none' }}>
            {/* Campo de pesquisa */}
            <div className={styles.searchContainer}>
                <div className={styles.searchInputWrapper}>
                    <Search size={16} className={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder="Pesquisar por nome..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className={styles.searchInput}
                    />
                </div>
                {searchTerm && filteredRegistros.length === 0 ? (
                    <p className={styles.noResultsMessage}>
                        Nenhum resultado encontrado
                    </p>
                ) : null}
            </div>

            {/* Registros filtrados */}
            <div className={`${styles.transition} ${fadeVisible ? styles.fadeIn : styles.fadeOut}`}>
                {filteredRegistros.map((registro, index) => {
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
                        <div key={index}>
                            <EditableTransferDetail
                                comprovante={comprovanteId ? registro.comprovante[comprovanteId] : null}
                                transferencia={transferenciaObj}
                                isValid={isValid}
                                comprovanteId={comprovanteId}
                                transferenciaId={transferenciaId}
                                registroIndex={index}
                                onComprovanteChange={onComprovanteChange}
                                onTransferenciaChange={onTransferenciaChange}
                            />
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default RecordsDisplay;