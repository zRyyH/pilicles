import React from 'react';
import { formatCurrency } from '../../utils/formatters';
import { Info, Check, X, Copy } from 'lucide-react';
import styles from './ResultSection.module.css';

function ResultDetails({ result }) {
    if (!result) return null;

    return (
        <div className={styles.resultadoEfetivar}>
            <h3>Resultado da Efetivação</h3>
            <div className={styles.resultadoMensagem}>
                <Info size={20} />
                <p>{result.message}</p>
            </div>

            <div className={styles.metricasGrid}>
                {/* Total processed */}
                <div className={styles.metricaItem}>
                    <Info size={18} className={styles.metricaIcon} />
                    <span className={styles.metricaLabel}>Total Processados</span>
                    <span className={styles.metricaValue}>{result.totalProcessados}</span>
                </div>

                {/* Valid processed */}
                <div className={`${styles.metricaItem} ${styles.metricaValido}`}>
                    <Check size={18} className={styles.metricaIcon} />
                    <span className={styles.metricaLabel}>Válidos Processados</span>
                    <span className={styles.metricaValue}>{result.validosProcessados}</span>
                </div>

                {/* Invalid processed */}
                <div className={`${styles.metricaItem} ${styles.metricaInvalido}`}>
                    <X size={18} className={styles.metricaIcon} />
                    <span className={styles.metricaLabel}>Inválidos Processados</span>
                    <span className={styles.metricaValue}>{result.invalidosProcessados}</span>
                </div>

                {/* Duplicates */}
                <div className={styles.metricaItem}>
                    <Copy size={18} className={styles.metricaIcon} />
                    <span className={styles.metricaLabel}>Duplicados Ignorados</span>
                    <span className={styles.metricaValue}>{result.duplicadosIgnorados}</span>
                </div>
            </div>

            {/* Duplicate details */}
            {result.detalheDuplicados?.length > 0 && (
                <div className={styles.detalheDuplicados}>
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
                                    <tr key={idx} className={item.status === 'valido' ? styles.itemValido : styles.itemInvalido}>
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