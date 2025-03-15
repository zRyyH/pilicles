import React, { useState, useCallback } from 'react';
import { Info, Check } from 'lucide-react';
import styles from './ResultSection.module.css';
import TabsNavigation from './TabsNavigation';
import RecordsDisplay from './RecordsDisplay';
import MetricsSummary from './MetricsSummary';
import ResultDetails from './ResultDetails';
import InlineLoading from '../InlineLoading';
import { comprovantesService } from '../../services/apiService';

function ResultSection({ validos = [], invalidos = [], onEfetivar }) {
    // State management
    const [dadosEditados, setDadosEditados] = useState({
        validos: [...validos],
        invalidos: [...invalidos]
    });
    const [respostaEfetivar, setRespostaEfetivar] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('validos');
    const [fadeState, setFadeState] = useState(true);

    // Handle field change for comprovante
    const handleComprovanteChange = useCallback((registroIndex, isValid, comprovanteId, campo, valor) => {
        setDadosEditados(prev => {
            const novosDados = { ...prev };
            const tipo = isValid ? 'validos' : 'invalidos';
            const registro = { ...novosDados[tipo][registroIndex] };

            if (registro.comprovante && typeof registro.comprovante === 'object') {
                const uuidKey = Object.keys(registro.comprovante)[0];
                if (uuidKey) {
                    registro.comprovante[uuidKey] = {
                        ...registro.comprovante[uuidKey],
                        [campo]: valor
                    };
                    novosDados[tipo][registroIndex] = registro;
                }
            }
            return novosDados;
        });
    }, []);

    // Handle field change for transferencia
    const handleTransferenciaChange = useCallback((registroIndex, isValid, transferenciaId, campo, valor) => {
        setDadosEditados(prev => {
            const novosDados = { ...prev };
            const tipo = isValid ? 'validos' : 'invalidos';
            const registro = { ...novosDados[tipo][registroIndex] };

            if (registro.transferencia && typeof registro.transferencia === 'object' && registro.transferencia !== 'Desconhecido') {
                const uuidKey = Object.keys(registro.transferencia).find(key => key !== 'banco' && key !== 'confianca');

                if (uuidKey) {
                    registro.transferencia[uuidKey] = {
                        ...registro.transferencia[uuidKey],
                        [campo]: valor
                    };
                    novosDados[tipo][registroIndex] = registro;
                } else if (['banco', 'confianca'].includes(campo)) {
                    registro.transferencia[campo] = valor;
                    novosDados[tipo][registroIndex] = registro;
                }
            }
            return novosDados;
        });
    }, []);

    // Submit changes to server
    const efetivarAlteracoes = async () => {
        if (isLoading) return;

        try {
            setIsLoading(true);
            setFadeState(false);

            // Simple fade transition
            setTimeout(async () => {
                const result = await comprovantesService.efetivarAlteracoes(dadosEditados);
                setRespostaEfetivar(result);

                if (onEfetivar && typeof onEfetivar === 'function') {
                    onEfetivar(dadosEditados);
                }

                // Mudar para a aba de resultado após completar
                setActiveTab('resultado');
                setIsLoading(false);
                setFadeState(true);
            }, 300);

        } catch (error) {
            console.error('Erro ao efetivar alterações:', error);
            alert(`Erro ao efetivar alterações: ${error.message}`);
            setIsLoading(false);
            setFadeState(true);
        }
    };

    // Tab change handler with simplified fade
    const handleTabChange = (tab) => {
        if (tab === activeTab) return;

        setFadeState(false);

        setTimeout(() => {
            setActiveTab(tab);
            setFadeState(true);
        }, 300);
    };

    // Calculate tab data
    const isEmpty = dadosEditados.validos.length === 0 && dadosEditados.invalidos.length === 0;
    const tabs = [
        { id: 'validos', label: 'Válidos', count: dadosEditados.validos.length },
        { id: 'invalidos', label: 'Inválidos', count: dadosEditados.invalidos.length },
        { id: 'metricas', label: 'Resumo' }
    ];

    if (respostaEfetivar) {
        tabs.push({ id: 'resultado', label: 'Resultado' });
    }

    // Render empty state
    if (isEmpty) {
        return (
            <div className={styles.container}>
                <div className={`${styles.emptyState} ${styles.fade}`}>
                    <Info size={48} className={styles.emptyStateIcon} />
                    <p>Nenhum resultado para exibir</p>
                    <span>Selecione e envie os arquivos para análise</span>
                </div>
            </div>
        );
    }

    // Estilo inline para garantir que não haja scroll em nenhum lugar
    const noScrollStyle = {
        height: 'auto',
        maxHeight: 'none',
        minHeight: 'auto',
        overflow: 'visible'
    };

    return (
        <div className={styles.container} style={noScrollStyle}>
            {/* Tabs navigation */}
            <TabsNavigation
                activeTab={activeTab}
                tabs={tabs}
                onTabChange={handleTabChange}
            />

            {/* Tab content with fade transition */}
            <div
                className={`${styles.tabContent} ${fadeState ? styles.fadeIn : styles.fadeOut}`}
                style={noScrollStyle}
            >
                {activeTab === 'validos' && (
                    <RecordsDisplay
                        registros={dadosEditados.validos}
                        isValid={true}
                        onComprovanteChange={handleComprovanteChange}
                        onTransferenciaChange={handleTransferenciaChange}
                    />
                )}

                {activeTab === 'invalidos' && (
                    <RecordsDisplay
                        registros={dadosEditados.invalidos}
                        isValid={false}
                        onComprovanteChange={handleComprovanteChange}
                        onTransferenciaChange={handleTransferenciaChange}
                    />
                )}

                {activeTab === 'metricas' && (
                    <MetricsSummary
                        validos={dadosEditados.validos}
                        invalidos={dadosEditados.invalidos}
                    />
                )}

                {activeTab === 'resultado' && <ResultDetails result={respostaEfetivar} />}
            </div>

            {/* Actions */}
            <div className={styles.actionsContainer}>
                {isLoading ? (
                    <InlineLoading.Small />
                ) : (
                    <button
                        className={styles.efetivarButton}
                        onClick={efetivarAlteracoes}
                        disabled={isLoading}
                    >
                        <Check size={20} />
                        EFETIVAR ALTERAÇÕES
                    </button>
                )}
            </div>
        </div>
    );
}

export default ResultSection;