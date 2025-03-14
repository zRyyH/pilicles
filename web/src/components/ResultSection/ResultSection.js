import React, { useState, useCallback, useEffect } from 'react';
import { formatCurrency } from '../../utils/formatters';
import EditableTransferDetail from '../EditableTransferDetail';
import InlineLoading from '../InlineLoading';
import { Info, Check, X, Copy, DollarSign } from 'lucide-react';
import styles from './ResultSection.module.css';
import TabsNavigation from './TabsNavigation';
import RecordsDisplay from './RecordsDisplay';
import MetricsSummary from './MetricsSummary';
import ResultDetails from './ResultDetails';
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
    const [isAnimating, setIsAnimating] = useState(false);
    const [mainAnimationComplete, setMainAnimationComplete] = useState(false);
    
    // Efeito para animar o componente inteiro ao montar
    useEffect(() => {
        const timer = setTimeout(() => {
            setMainAnimationComplete(true);
        }, 600);
        
        return () => clearTimeout(timer);
    }, []);

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
        if (isLoading || isAnimating) return;
        
        try {
            setIsLoading(true);
            setIsAnimating(true);
            
            // Adicionar animação de saída e depois fazer a requisição
            setTimeout(async () => {
                const result = await comprovantesService.efetivarAlteracoes(dadosEditados);
                setRespostaEfetivar(result);
                
                if (onEfetivar && typeof onEfetivar === 'function') {
                    onEfetivar(dadosEditados);
                }
                
                // Mudar para a aba de resultado após completar
                setActiveTab('resultado');
                setIsAnimating(false);
                setIsLoading(false);
            }, 300);
            
        } catch (error) {
            console.error('Erro ao efetivar alterações:', error);
            alert(`Erro ao efetivar alterações: ${error.message}`);
            setIsAnimating(false);
            setIsLoading(false);
        }
    };

    // Tab change handler com animação
    const handleTabChange = (tab) => {
        if (isAnimating || tab === activeTab) return;
        
        setIsAnimating(true);
        
        // Efeito de transição suave
        setTimeout(() => {
            setActiveTab(tab);
            setIsAnimating(false);
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
            <div className={`${styles.container} ${styles.animateFadeIn}`}>
                <div className={`${styles.emptyState} ${styles.animateScaleIn}`}>
                    <Info size={48} className={`${styles.emptyStateIcon} ${styles.animatePulse}`} />
                    <p>Nenhum resultado para exibir</p>
                    <span>Selecione e envie os arquivos para análise</span>
                </div>
            </div>
        );
    }

    return (
        <div className={`
            ${styles.container} 
            ${mainAnimationComplete ? styles.animateFadeIn : ''}
            ${isAnimating ? styles.animateScaleOut : ''}
        `}>
            {/* Tabs navigation */}
            <TabsNavigation 
                activeTab={activeTab} 
                tabs={tabs} 
                onTabChange={handleTabChange} 
            />

            {/* Tab content */}
            <div className={`
                ${styles.tabContent} 
                ${isAnimating ? styles.fadeOut : styles.fadeIn}
                ${mainAnimationComplete ? styles.animateFadeIn : ''}
            `}>
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
            <div className={`${styles.actionsContainer} ${mainAnimationComplete ? styles.animateFadeInUp : ''}`}>
                {isLoading ? (
                    <div className={`${styles.loadingContainer} ${styles.animateFadeIn}`}>
                        <InlineLoading message="Processando efetivação..." size="medium" />
                    </div>
                ) : (
                    <button
                        className={`${styles.efetivarButton} ${styles.hoverLift} ${styles.animatePulse}`}
                        onClick={efetivarAlteracoes}
                        disabled={isLoading || isAnimating}
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