import React, { useState, useEffect } from 'react';
import { formatCurrency } from '../../utils/formatters';
import { Info, Check, X, Copy } from 'lucide-react';
import styles from './ResultSection.module.css';

function ResultDetails({ result }) {
    const [animate, setAnimate] = useState(false);
    const [animatedValues, setAnimatedValues] = useState({
        totalProcessados: 0,
        validosProcessados: 0,
        invalidosProcessados: 0,
        duplicadosIgnorados: 0
    });
    
    useEffect(() => {
        // Iniciar animação após montagem
        const timer = setTimeout(() => {
            setAnimate(true);
        }, 100);
        
        return () => clearTimeout(timer);
    }, []);
    
    // Animação para contagem de números
    useEffect(() => {
        if (!result) return;
        
        const duration = 1000; // duração em milissegundos
        const steps = 20;
        const interval = duration / steps;
        
        let step = 0;
        const timer = setInterval(() => {
            step++;
            const progress = step / steps;
            
            setAnimatedValues({
                totalProcessados: Math.round(progress * result.totalProcessados),
                validosProcessados: Math.round(progress * result.validosProcessados),
                invalidosProcessados: Math.round(progress * result.invalidosProcessados),
                duplicadosIgnorados: Math.round(progress * result.duplicadosIgnorados),
            });
            
            if (step === steps) {
                clearInterval(timer);
                // Garantir que os valores finais sejam exatos
                setAnimatedValues({
                    totalProcessados: result.totalProcessados,
                    validosProcessados: result.validosProcessados,
                    invalidosProcessados: result.invalidosProcessados,
                    duplicadosIgnorados: result.duplicadosIgnorados,
                });
            }
        }, interval);
        
        return () => clearInterval(timer);
    }, [result]);

    if (!result) return null;

    return (
        <div className={`${styles.resultadoEfetivar} ${animate ? styles.animateFadeInUp : ''}`}>
            <h3 className={animate ? styles.animateFadeIn : ''}>Resultado da Efetivação</h3>
            <div className={`${styles.resultadoMensagem} ${animate ? styles.animateFadeInRight : ''}`}>
                <Info size={20} />
                <p>{result.message}</p>
            </div>

            <div className={`${styles.metricasGrid} ${animate ? styles.animateFadeIn : ''}`}>
                {/* Total processed */}
                <div className={`${styles.metricaItem} ${animate ? styles.animateScaleIn : ''}`} 
                     style={{ animationDelay: '100ms' }}>
                    <Info size={18} className={styles.metricaIcon} />
                    <span className={styles.metricaLabel}>Total Processados</span>
                    <span className={styles.metricaValue}>{animatedValues.totalProcessados}</span>
                </div>

                {/* Valid processed */}
                <div className={`${styles.metricaItem} ${styles.metricaValido} ${animate ? styles.animateScaleIn : ''}`}
                     style={{ animationDelay: '200ms' }}>
                    <Check size={18} className={styles.metricaIcon} />
                    <span className={styles.metricaLabel}>Válidos Processados</span>
                    <span className={styles.metricaValue}>{animatedValues.validosProcessados}</span>
                </div>

                {/* Invalid processed */}
                <div className={`${styles.metricaItem} ${styles.metricaInvalido} ${animate ? styles.animateScaleIn : ''}`}
                     style={{ animationDelay: '300ms' }}>
                    <X size={18} className={styles.metricaIcon} />
                    <span className={styles.metricaLabel}>Inválidos Processados</span>
                    <span className={styles.metricaValue}>{animatedValues.invalidosProcessados}</span>
                </div>

                {/* Duplicates */}
                <div className={`${styles.metricaItem} ${animate ? styles.animateScaleIn : ''}`}
                     style={{ animationDelay: '400ms' }}>
                    <Copy size={18} className={styles.metricaIcon} />
                    <span className={styles.metricaLabel}>Duplicados Ignorados</span>
                    <span className={styles.metricaValue}>{animatedValues.duplicadosIgnorados}</span>
                </div>
            </div>

            {/* Duplicate details */}
            {result.detalheDuplicados?.length > 0 && (
                <div className={`${styles.detalheDuplicados} ${animate ? styles.animateFadeInUp : ''}`}
                     style={{ animationDelay: '300ms' }}>
                    <h4>Detalhes dos Comprovantes Duplicados</h4>
                    <div className={styles.duplicadosTabela}>
                        <table>
                            <thead>
                                <tr>
                                    <th>Nome</th>
                                    <th>Valor</th>
                                    <th>Data</th>
                                    <th>Banco</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {result.detalheDuplicados.map((item, idx) => (
                                    <tr 
                                        key={idx} 
                                        className={`
                                            ${item.status === 'valido' ? styles.itemValido : styles.itemInvalido}
                                            ${animate ? styles.animateFadeIn : ''}
                                        `}
                                        style={{ animationDelay: `${500 + idx * 50}ms` }}
                                    >
                                        <td>{item.nome}</td>
                                        <td>{formatCurrency(item.valor)}</td>
                                        <td>{item.data}</td>
                                        <td>{item.banco}</td>
                                        <td className={item.status === 'valido' ? styles.statusValido : styles.statusInvalido}>
                                            {item.status === 'valido' ? 'Válido' : 'Inválido'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ResultDetails;