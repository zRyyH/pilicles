import React from 'react';
import styles from './FileUpload.module.css';

function FileUpload({ files, multipleFiles, onFileChange, onMultipleFilesChange }) {
    // Lista de tipos de arquivos individuais
    const singleFileTypes = [
        { id: 'corpx', label: 'Corpx' },
        { id: 'itau', label: 'Itau' },
        { id: 'digital', label: 'Digital' },
        { id: 'generico', label: 'Generico' }
    ];

    // Função para remover um arquivo individual
    const handleRemoveSingleFile = (fileId, e) => {
        e.stopPropagation(); // Evita que o evento se propague para outros elementos

        // Chamamos diretamente uma função que atualiza o estado no componente pai
        if (typeof onFileChange === 'function') {
            // Passamos apenas o fileId e um flag explícito de remoção
            onFileChange({
                isRemoval: true,
                fileId: fileId
            });
        }
    };

    // Função para lidar com seleção de arquivo individual
    const handleSingleFileChange = (e, fileId) => {
        // O manipulador original deve ser chamado normalmente
        if (typeof onFileChange === 'function') {
            onFileChange(e, fileId);
        }
    };

    // Função para remover um arquivo da lista de múltiplos
    const handleRemoveMultipleFile = (index, e) => {
        e.stopPropagation(); // Evita que o evento se propague

        // Cria uma cópia da lista de arquivos
        const updatedFiles = [...multipleFiles];
        // Remove o arquivo pelo índice
        updatedFiles.splice(index, 1);

        // Chama o manipulador com a lista atualizada
        if (typeof onMultipleFilesChange === 'function') {
            onMultipleFilesChange({
                target: {
                    files: updatedFiles
                },
                isRemoval: true
            });
        }
    };

    return (
        <>
            <section className={styles.singleFileSection}>
                <div className={styles.sectionHeader}>
                    <div className={styles.sectionIcon}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                            <polyline points="14 2 14 8 20 8"></polyline>
                            <line x1="12" y1="18" x2="12" y2="12"></line>
                            <line x1="9" y1="15" x2="15" y2="15"></line>
                        </svg>
                    </div>
                    <h3 className={styles.sectionTitle}>Arquivos Individuais</h3>
                </div>

                <div className={styles.fileTypesGrid}>
                    {singleFileTypes.map(file => (
                        <div key={file.id} className={styles.inputGroup}>
                            <label>{file.label} (opcional)</label>
                            <label
                                htmlFor={file.id}
                                className={styles.fileButton}
                            >
                                <span className={styles.fileButtonIcon}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                        <polyline points="17 8 12 3 7 8"></polyline>
                                        <line x1="12" y1="3" x2="12" y2="15"></line>
                                    </svg>
                                </span>
                                Escolher arquivo
                            </label>
                            <input
                                id={file.id}
                                type="file"
                                onChange={(e) => handleSingleFileChange(e, file.id)}
                                accept="*"
                                className={styles.hiddenInput}
                            />
                            {files && files[file.id] && (
                                <div className={styles.fileName}>
                                    <span className={styles.fileIcon}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                                            <polyline points="13 2 13 9 20 9"></polyline>
                                        </svg>
                                    </span>
                                    <span className={styles.fileNameText}>{files[file.id].name}</span>
                                    <button
                                        type="button"
                                        className={styles.removeFileButton}
                                        onClick={(e) => handleRemoveSingleFile(file.id, e)}
                                        aria-label="Remover arquivo"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <circle cx="12" cy="12" r="10"></circle>
                                            <line x1="15" y1="9" x2="9" y2="15"></line>
                                            <line x1="9" y1="9" x2="15" y2="15"></line>
                                        </svg>
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </section>

            <section className={styles.multiFileSection}>
                <div className={styles.sectionHeader}>
                    <div className={styles.sectionIcon}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M16 16v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h1"></path>
                            <path d="M21 14H11a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2z"></path>
                        </svg>
                    </div>
                    <h3 className={styles.sectionTitle}>
                        Comprovantes
                        {multipleFiles && multipleFiles.length > 0 && (
                            <span className={styles.fileCounter}>{multipleFiles.length}</span>
                        )}
                    </h3>
                </div>

                <div className={styles.multiUploadArea}>
                    <div className={styles.uploadIcon}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="17 8 12 3 7 8"></polyline>
                            <line x1="12" y1="3" x2="12" y2="15"></line>
                        </svg>
                    </div>
                    <p className={styles.uploadText}>
                        Arraste e solte arquivos aqui ou clique para selecionar
                    </p>
                    <label
                        htmlFor="comprovantes"
                        className={styles.fileButton}
                    >
                        <span className={styles.fileButtonIcon}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                <polyline points="17 8 12 3 7 8"></polyline>
                                <line x1="12" y1="3" x2="12" y2="15"></line>
                            </svg>
                        </span>
                        Escolher arquivos
                    </label>
                    <input
                        id="comprovantes"
                        type="file"
                        multiple
                        onChange={onMultipleFilesChange}
                        accept="*"
                        className={styles.hiddenInput}
                    />
                </div>

                {multipleFiles && multipleFiles.length > 0 ? (
                    <div className={styles.fileList}>
                        {multipleFiles.map((file, index) => (
                            <div key={index} className={styles.fileItem}>
                                <span className={styles.fileItemIcon}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                                        <polyline points="13 2 13 9 20 9"></polyline>
                                    </svg>
                                </span>
                                <span className={styles.fileItemName}>{file.name}</span>
                                <button
                                    type="button"
                                    className={styles.removeFileButton}
                                    onClick={(e) => handleRemoveMultipleFile(index, e)}
                                    aria-label="Remover arquivo"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="12" cy="12" r="10"></circle>
                                        <line x1="15" y1="9" x2="9" y2="15"></line>
                                        <line x1="9" y1="9" x2="15" y2="15"></line>
                                    </svg>
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className={styles.emptyFiles}>
                        Nenhum arquivo selecionado
                    </div>
                )}
            </section>
        </>
    );
}

export default FileUpload;