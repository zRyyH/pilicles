import React, { useState, useCallback, memo, useRef, useEffect } from 'react';
import { Edit2, Check, ChevronDown } from 'lucide-react';
import styles from './EditableTransferDetail.module.css';

// Lista de campos a serem exibidos/editados
const CAMPOS = [
    { id: 'data', label: 'Data' },
    { id: 'nome', label: 'Nome' },
    { id: 'valor', label: 'Valor' },
    { id: 'banco', label: 'Banco' },
    { id: 'path', label: 'Arquivo' }
];

// Componente para campo editável (memoizado para prevenir re-renderizações)
const EditableField = memo(function EditableField({ campo, value, isEditing, onToggleEdit, onChange }) {
    const inputRef = useRef(null);

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isEditing]);

    const formatValue = useCallback((fieldId, val) => {
        if (fieldId === 'valor' && val) {
            return typeof val === 'number' ?
                new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val) : val;
        }
        if (fieldId === 'path' && val) {
            // Mostra apenas o nome do arquivo sem o caminho completo
            return val.split('/').pop();
        }
        return val || '';
    }, []);

    const handleChange = useCallback((e) => {
        let newValue = e.target.value;
        if (campo === 'valor' && newValue) {
            newValue = parseFloat(newValue.replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
        }
        onChange(newValue);
    }, [campo, onChange]);

    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Enter' || e.key === 'Escape') {
            onToggleEdit();
        }
    }, [onToggleEdit]);

    return (
        <>
            {isEditing ? (
                <div className={styles.editingField}>
                    <input
                        ref={inputRef}
                        type={campo === 'valor' ? 'number' : campo === 'path' ? 'text' : 'text'}
                        value={value}
                        step={campo === 'valor' ? '0.01' : undefined}
                        onChange={handleChange}
                        onKeyDown={handleKeyDown}
                        className={styles.input}
                        placeholder={campo === 'path' ? 'Nome do arquivo' : ''}
                    />
                    <button
                        onClick={onToggleEdit}
                        className={styles.button}
                        title="Confirmar alteração"
                    >
                        <Check size={16} />
                    </button>
                </div>
            ) : (
                <div
                    className={styles.displayField}
                    data-field-type={campo}
                >
                    <span className={value ? '' : styles.unknown}>
                        {value ? formatValue(campo, value) : 'Não informado'}
                    </span>
                    <button
                        onClick={onToggleEdit}
                        className={styles.button}
                        title="Editar este campo"
                    >
                        <Edit2 size={14} />
                    </button>
                </div>
            )}
        </>
    );
});

// Componente principal
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
    // Estado para controlar edição de campos
    const [editing, setEditing] = useState({});

    // Estado para controlar expansão/colapso
    const [isExpanded, setIsExpanded] = useState(false);

    // Função para alternar edição de campo
    const toggleEdit = useCallback((fieldId, type) => {
        const key = `${type}-${fieldId}`;
        setEditing(prev => ({ ...prev, [key]: !prev[key] }));
    }, []);

    // Função para atualizar dados
    const handleUpdate = useCallback((campo, valor, tipo) => {
        if (tipo === 'comprovante' && comprovanteId) {
            onComprovanteChange(registroIndex, isValid, comprovanteId, campo, valor);
        } else if (tipo === 'transferencia' && transferenciaId) {
            onTransferenciaChange(registroIndex, isValid, transferenciaId, campo, valor);
        }
    }, [registroIndex, isValid, comprovanteId, transferenciaId, onComprovanteChange, onTransferenciaChange]);

    // Verificações de dados
    const hasComprovante = comprovante && typeof comprovante === 'object';
    const hasTransferencia = transferencia && typeof transferencia === 'object' &&
        transferencia !== 'Desconhecido';

    // Mostrar resumo de valores quando colapsado
    const getSummaryText = () => {
        if (hasComprovante) {
            return (
                <div className={styles.cardSummary}>
                    {comprovante.nome && <span className={styles.summaryName}>{comprovante.nome}</span>}
                    {comprovante.valor && (
                        <span className={styles.summaryValue}>
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(comprovante.valor)}
                        </span>
                    )}
                    {comprovante.path && (
                        <span className={styles.summaryFile}>
                            {comprovante.path.split('/').pop()}
                        </span>
                    )}
                </div>
            );
        }
        return null;
    };

    return (
        <div className={`${styles.card} ${isValid ? styles.validCard : styles.invalidCard}`}>
            <div
                className={styles.header}
                onClick={() => setIsExpanded(prev => !prev)}
                aria-expanded={isExpanded}
            >
                <h4 className={styles.title}>Registro {registroIndex + 1}</h4>

                {/* Resumo quando colapsado */}
                {!isExpanded && getSummaryText()}

                <div className={styles.headerControls}>
                    <span className={`${styles.badge} ${isValid ? styles.validBadge : styles.invalidBadge}`}>
                        {isValid ? 'Válido' : 'Inválido'}
                    </span>
                    <div className={`${styles.iconRotate} ${isExpanded ? styles.iconRotateUp : ''}`}>
                        <ChevronDown size={16} />
                    </div>
                </div>
            </div>

            <div className={`${styles.content} ${isExpanded ? styles.contentExpanded : ''}`}>
                <div className={styles.grid}>
                    {CAMPOS.map(campo => (
                        <div key={campo.id} className={styles.row}>
                            <div className={styles.label}>{campo.label}</div>

                            {hasComprovante && (
                                <div className={styles.field}>
                                    <EditableField
                                        campo={campo.id}
                                        value={comprovante[campo.id] || ''}
                                        isEditing={editing[`comprovante-${campo.id}`]}
                                        onToggleEdit={() => toggleEdit(campo.id, 'comprovante')}
                                        onChange={(val) => handleUpdate(campo.id, val, 'comprovante')}
                                    />
                                    <div className={styles.fieldLabel}>Comprovante</div>
                                </div>
                            )}

                            {hasTransferencia ? (
                                <div className={styles.field}>
                                    <EditableField
                                        campo={campo.id}
                                        value={transferencia[campo.id] || ''}
                                        isEditing={editing[`transferencia-${campo.id}`]}
                                        onToggleEdit={() => toggleEdit(campo.id, 'transferencia')}
                                        onChange={(val) => handleUpdate(campo.id, val, 'transferencia')}
                                    />
                                    <div className={styles.fieldLabel}>Transferência</div>
                                </div>
                            ) : (
                                <div className={styles.field}>
                                    <span className={styles.unknown}>Desconhecido</span>
                                    <div className={styles.fieldLabel}>Transferência</div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default memo(EditableTransferDetail);