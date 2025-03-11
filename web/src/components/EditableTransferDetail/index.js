import React, { useState } from 'react';
import { formatField, sanitize } from '../../utils/formatters';
import { Edit2, Check } from 'lucide-react';
import styles from '../ResultSection/ResultSection.module.css';

function EditableTransferDetail({
    comprovante,
    transferencia,
    isValid,
    onComprovanteChange,
    onTransferenciaChange,
    comprovanteId,
    transferenciaId,
    registroIndex
}) {
    // Campos a serem exibidos/editados
    const campos = [
        { id: 'data', label: 'Data' },
        { id: 'nome', label: 'Nome' },
        { id: 'valor', label: 'Valor' },
        { id: 'banco', label: 'Banco' }
    ];

    // Estado para controlar o modo de edição de cada campo
    const [editMode, setEditMode] = useState({
        comprovante: {},
        transferencia: {}
    });

    // Alternar o modo de edição de um campo
    const toggleEditMode = (campo, tipo) => {
        setEditMode(prev => ({
            ...prev,
            [tipo]: {
                ...prev[tipo],
                [campo.id]: !prev[tipo][campo.id]
            }
        }));
    };

    // Atualizar o valor de um campo
    const handleFieldChange = (campo, valor, tipo) => {
        // Formata o valor se for um campo numérico
        let parsedValue = valor;
        if (campo.id === 'valor' && typeof valor === 'string') {
            // Remove formatação e converte para número
            parsedValue = parseFloat(sanitize(valor).replace(/[^\d,.-]/g, '').replace(',', '.')) || 0;
        }

        if (tipo === 'comprovante' && comprovanteId) {
            onComprovanteChange(registroIndex, isValid, comprovanteId, campo.id, parsedValue);
        } else if (tipo === 'transferencia' && transferenciaId) {
            onTransferenciaChange(registroIndex, isValid, transferenciaId, campo.id, parsedValue);
        }
    };

    // Verifica se o objeto comprovante é válido
    const comprovanteValido = comprovante && typeof comprovante === 'object';

    // Verifica se o objeto transferencia é válido
    const transferenciaValida = transferencia && typeof transferencia === 'object' &&
        transferencia !== 'Desconhecido';

    return (
        <div className={`${styles.resultCard} ${isValid ? styles.validoCard : styles.invalidoCard}`}>
            <div className={styles.resultCardHeader}>
                <h4>Registro {registroIndex + 1}</h4>
                <span className={isValid ? styles.validoBadge : styles.invalidoBadge}>
                    {isValid ? 'Válido' : 'Inválido'}
                </span>
            </div>

            <div style={{ padding: '12px' }}>
                <div className={styles.transferContent}>
                    {campos.map(campo => {
                        const compIsEditing = editMode.comprovante?.[campo.id] || false;
                        const transIsEditing = editMode.transferencia?.[campo.id] || false;

                        const compValor = comprovanteValido ? comprovante[campo.id] || '' : '';
                        const transValor = transferenciaValida ? transferencia[campo.id] || '' : '';

                        const compFormatted = formatField(campo.id, compValor);
                        const transFormatted = formatField(campo.id, transValor);

                        return (
                            <div key={campo.id} className={styles.infoRow}>
                                <div className={styles.infoLabel}>{campo.label}</div>

                                {/* Comprovante */}
                                {comprovanteValido && (
                                    <div className={styles.infoField}>
                                        {compIsEditing ? (
                                            <div className={styles.editingField}>
                                                <input
                                                    type={campo.id === 'valor' ? 'number' : 'text'}
                                                    value={compValor}
                                                    step={campo.id === 'valor' ? '0.01' : undefined}
                                                    onChange={(e) => handleFieldChange(campo, e.target.value, 'comprovante')}
                                                    className={styles.fieldInput}
                                                />
                                                <button
                                                    className={styles.iconButton}
                                                    onClick={() => toggleEditMode(campo, 'comprovante')}
                                                    title="Salvar"
                                                >
                                                    <Check size={16} />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className={styles.displayField}>
                                                <span>{compFormatted}</span>
                                                <button
                                                    className={styles.iconButton}
                                                    onClick={() => toggleEditMode(campo, 'comprovante')}
                                                    title="Editar comprovante"
                                                >
                                                    <Edit2 size={14} />
                                                </button>
                                            </div>
                                        )}
                                        <div className={styles.fieldLabel}>Comprovante</div>
                                    </div>
                                )}

                                {/* Transferência */}
                                {transferenciaValida ? (
                                    <div className={styles.infoField}>
                                        {transIsEditing ? (
                                            <div className={styles.editingField}>
                                                <input
                                                    type={campo.id === 'valor' ? 'number' : 'text'}
                                                    value={transValor}
                                                    step={campo.id === 'valor' ? '0.01' : undefined}
                                                    onChange={(e) => handleFieldChange(campo, e.target.value, 'transferencia')}
                                                    className={styles.fieldInput}
                                                />
                                                <button
                                                    className={styles.iconButton}
                                                    onClick={() => toggleEditMode(campo, 'transferencia')}
                                                    title="Salvar"
                                                >
                                                    <Check size={16} />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className={styles.displayField}>
                                                <span>{transFormatted}</span>
                                                <button
                                                    className={styles.iconButton}
                                                    onClick={() => toggleEditMode(campo, 'transferencia')}
                                                    title="Editar transferência"
                                                >
                                                    <Edit2 size={14} />
                                                </button>
                                            </div>
                                        )}
                                        <div className={styles.fieldLabel}>Transferência</div>
                                    </div>
                                ) : (
                                    <div className={styles.infoField}>
                                        <span className={styles.desconhecido}>Desconhecido</span>
                                        <div className={styles.fieldLabel}>Transferência</div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export default EditableTransferDetail;