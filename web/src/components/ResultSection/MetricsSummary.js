import React, { useState, useEffect } from 'react';
import { formatCurrency } from '../../utils/formatters';
import { Info, Check, X, DollarSign } from 'lucide-react';
import styles from './ResultSection.module.css';

function MetricsSummary({ validos, invalidos }) {
    // Estado para os valores
    const [values, setValues] = useState({
        qtdTotal: 0,
        qtdValidos: 0,
        qtdInvalidos: 0,
        totalGeral: 0,
        totalValidos: 0,
        totalInvalidos: 0
    });

    // Calcular métricas
    useEffect(() => {
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

        // Simplified animation - just one timing update instead of interval
        setTimeout(() => {
            setValues({
                qtdTotal,
                qtdValidos,
                qtdInvalidos,
                totalGeral,
                totalValidos,
                totalInvalidos
            });
        }, 300);
    }, [validos, invalidos]);

    return (
        <div className={`${styles.metricas} ${styles.fade}`}>
            <h3>Resumo da Análise</h3>
            <div className={styles.metricasGrid}>
                {/* Total metrics */}
                <div className={styles.metricaItem}>
                    <Info size={20} className={styles.metricaIcon} />
                    <span className={styles.metricaLabel}>Total de Registros</span>
                    <span className={styles.metricaValue}>{values.qtdTotal}</span>
                </div>

                {/* Valid metrics */}
                <div className={`${styles.metricaItem} ${styles.metricaValido}`}>
                    <Check size={20} className={styles.metricaIcon} />
                    <span className={styles.metricaLabel}>Registros Válidos</span>
                    <span className={styles.metricaValue}>{values.qtdValidos}</span>
                </div>

                {/* Invalid metrics */}
                <div className={`${styles.metricaItem} ${styles.metricaInvalido}`}>
                    <X size={20} className={styles.metricaIcon} />
                    <span className={styles.metricaLabel}>Registros Inválidos</span>
                    <span className={styles.metricaValue}>{values.qtdInvalidos}</span>
                </div>

                {/* Total value */}
                <div className={styles.metricaItem}>
                    <DollarSign size={20} className={styles.metricaIcon} />
                    <span className={styles.metricaLabel}>Valor Total</span>
                    <span className={styles.metricaValue}>{formatCurrency(values.totalGeral)}</span>
                </div>

                {/* Valid value */}
                <div className={`${styles.metricaItem} ${styles.metricaValido}`}>
                    <DollarSign size={20} className={styles.metricaIcon} />
                    <span className={styles.metricaLabel}>Valor Válidos</span>
                    <span className={styles.metricaValue}>{formatCurrency(values.totalValidos)}</span>
                </div>

                {/* Invalid value */}
                <div className={`${styles.metricaItem} ${styles.metricaInvalido}`}>
                    <DollarSign size={20} className={styles.metricaIcon} />
                    <span className={styles.metricaLabel}>Valor Inválidos</span>
                    <span className={styles.metricaValue}>{formatCurrency(values.totalInvalidos)}</span>
                </div>
            </div>
        </div>
    );
}

export default MetricsSummary;