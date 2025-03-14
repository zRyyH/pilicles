import React, { useState, useCallback, useEffect } from 'react';
import EditableTransferDetail from '../EditableTransferDetail';
import { Info, Search } from 'lucide-react';
import styles from './ResultSection.module.css';

function RecordsDisplay({ registros, isValid, onComprovanteChange, onTransferenciaChange }) {
    // Estado para o termo de pesquisa
    const [searchTerm, setSearchTerm] = useState('');
    // Estado para controlar a visibilidade dos elementos (animação)
    const [visible, setVisible] = useState(false);
    // Estado para rastrear quando um novo resultado de pesquisa é mostrado
    const [searchChanged, setSearchChanged] = useState(false);
    
    // Efeito para iniciar a animação ao montar o componente
    useEffect(() => {
        setVisible(false);
        const timer = setTimeout(() => {
            setVisible(true);
        }, 100);
        
        return () => clearTimeout(timer);
    }, [isValid]); // Reiniciar animação quando mudar de aba (válidos/inválidos)
    
    // Handler para atualização do termo de pesquisa
    const handleSearchChange = useCallback((e) => {
        setSearchTerm(e.target.value);
        setSearchChanged(true);
        
        // Resetar a animação para os novos resultados de pesquisa
        setVisible(false);
        setTimeout(() => {
            setVisible(true);
            setSearchChanged(false);
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
            <div className={`${styles.emptyStateTab} ${styles.animateFadeIn}`}>
                <Info size={24} className={`${styles.emptyIcon} ${styles.animatePulse}`} />
                <p>Nenhum registro {isValid ? "válido" : "inválido"} encontrado</p>
            </div>
        );
    }

    return (
        <div className={`${styles.section} ${styles.animateFadeIn}`}>
            {/* Campo de pesquisa */}
            <div className={`${styles.searchContainer} ${styles.animateFadeInUp}`}>
                <div className={`${styles.searchInputWrapper} ${styles.transitionAll}`}>
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
                    <p className={`${styles.noResultsMessage} ${styles.animateFadeIn}`}>
                        Nenhum resultado encontrado
                    </p>
                ) : null}
            </div>

            {/* Registros filtrados */}
            <div className={visible ? styles.animateFadeIn : ''}>
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
                        <div 
                            key={index} 
                            className={`${styles.animateFadeInUp}`} 
                            style={{ 
                                animationDelay: `${(index * 50)}ms`,
                                opacity: visible ? 1 : 0,
                                transform: visible ? 'translateY(0)' : 'translateY(20px)',
                                transition: 'opacity 0.5s ease, transform 0.5s ease',
                                transitionDelay: `${(index * 50)}ms`
                            }}
                        >
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