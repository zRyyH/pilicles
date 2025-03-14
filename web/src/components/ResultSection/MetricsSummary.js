import React, { useState, useEffect } from 'react';
import { formatCurrency } from '../../utils/formatters';
import { Info, Check, X, DollarSign } from 'lucide-react';
import styles from './ResultSection.module.css';

function MetricsSummary({ validos, invalidos }) {
    // Estado para os valores animados
    const [animatedValues, setAnimatedValues] = useState({
        qtdTotal: 0,
        qtdValidos: 0,
        qtdInvalidos: 0,
        totalGeral: 0,
        totalValidos: 0,
        totalInvalidos: 0
    });
    
    // Estado para controlar a visibilidade dos elementos
    const [visible, setVisible] = useState(false);

    // Calcular métricas
    const totalValidos = validos.reduce((sum, item) => {
        const comprovanteId = item.comprovante ? Object.keys(item.comprovante)[0] : null;
        const valor = comprovanteId ? item.comprovante[comprovanteId]?.valor || 0 : 0;
        return sum + valor;
    }, 0);

    const totalInvalidos = invalidos.reduce((sum, item) => {
        const comprovanteId = item.comprovante ? Object.keys(item.comprovante)[0] : null;
        const valor = comprovanteId ? item.comprovante[comprovanteId]?.valor || 0 : 0;
        return sum + valor;
    }, 0);

    const qtdValidos = validos.length;
    const qtdInvalidos = invalidos.length;
    const totalGeral = totalValidos + totalInvalidos;
    const qtdTotal = qtdValidos + qtdInvalidos;

    // Animação de entrada e contador
    useEffect(() => {
        // Ativar a animação de entrada dos itens
        setVisible(true);
        
        // Animação de contagem dos números
        const duration = 1200; // duração em milissegundos
        const steps = 20;
        const interval = duration / steps;
        
        let step = 0;
        const timer = setInterval(() => {
            step++;
            const progress = step / steps;
            
            setAnimatedValues({
                qtdTotal: Math.round(progress * qtdTotal),
                qtdValidos: Math.round(progress * qtdValidos),
                qtdInvalidos: Math.round(progress * qtdInvalidos),
                totalGeral: progress * totalGeral,
                totalValidos: progress * totalValidos,
                totalInvalidos: progress * totalInvalidos
            });
            
            if (step === steps) {
                clearInterval(timer);
                // Garantir que os valores finais sejam exatos
                setAnimatedValues({
                    qtdTotal,
                    qtdValidos,
                    qtdInvalidos,
                    totalGeral,
                    totalValidos,
                    totalInvalidos
                });
            }
        }, interval);
        
        return () => clearInterval(timer);
    }, [qtdTotal, qtdValidos, qtdInvalidos, totalGeral, totalValidos, totalInvalidos]);

    return (
        <div className={`${styles.metricas} ${visible ? styles.fadeIn : ''}`}>
            <h3 className={styles.metricasTitulo}>Resumo da Análise</h3>
            <div className={styles.metricasGrid}>
                {/* Total metrics */}
                <div className={`${styles.metricaItem} ${visible ? styles.slideIn : ''}`} 
                     style={{animationDelay: '0ms'}}>
                    <Info size={20} className={styles.metricaIcon} />
                    <span className={styles.metricaLabel}>Total de Registros</span>
                    <span className={styles.metricaValue}>{animatedValues.qtdTotal}</span>
                </div>

                {/* Valid metrics */}
                <div className={`${styles.metricaItem} ${styles.metricaValido} ${visible ? styles.slideIn : ''}`}
                     style={{animationDelay: '100ms'}}>
                    <Check size={20} className={styles.metricaIcon} />
                    <span className={styles.metricaLabel}>Registros Válidos</span>
                    <span className={styles.metricaValue}>{animatedValues.qtdValidos}</span>
                </div>

                {/* Invalid metrics */}
                <div className={`${styles.metricaItem} ${styles.metricaInvalido} ${visible ? styles.slideIn : ''}`}
                     style={{animationDelay: '200ms'}}>
                    <X size={20} className={styles.metricaIcon} />
                    <span className={styles.metricaLabel}>Registros Inválidos</span>
                    <span className={styles.metricaValue}>{animatedValues.qtdInvalidos}</span>
                </div>

                {/* Total value */}
                <div className={`${styles.metricaItem} ${visible ? styles.slideIn : ''}`}
                     style={{animationDelay: '300ms'}}>
                    <DollarSign size={20} className={styles.metricaIcon} />
                    <span className={styles.metricaLabel}>Valor Total</span>
                    <span className={styles.metricaValue}>{formatCurrency(animatedValues.totalGeral)}</span>
                </div>

                {/* Valid value */}
                <div className={`${styles.metricaItem} ${styles.metricaValido} ${visible ? styles.slideIn : ''}`}
                     style={{animationDelay: '400ms'}}>
                    <DollarSign size={20} className={styles.metricaIcon} />
                    <span className={styles.metricaLabel}>Valor Válidos</span>
                    <span className={styles.metricaValue}>{formatCurrency(animatedValues.totalValidos)}</span>
                </div>

                {/* Invalid value */}
                <div className={`${styles.metricaItem} ${styles.metricaInvalido} ${visible ? styles.slideIn : ''}`}
                     style={{animationDelay: '500ms'}}>
                    <DollarSign size={20} className={styles.metricaIcon} />
                    <span className={styles.metricaLabel}>Valor Inválidos</span>
                    <span className={styles.metricaValue}>{formatCurrency(animatedValues.totalInvalidos)}</span>
                </div>
            </div>
        </div>
    );
}

export default MetricsSummary;