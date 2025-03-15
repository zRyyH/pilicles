import React, { useState, useRef, useEffect } from 'react';
import FileUpload from '../components/FileUpload';
import ResultSection from '../components/ResultSection';
import InlineLoading from '../components/InlineLoading';
import { handleGeneratePDF } from '../utils/pdfGenerator';
import { uploadService } from '../services/apiService';
import { FileCheck, AlertTriangle, FileText, UploadCloud } from 'lucide-react';
import styles from './HomePage.module.css';

function HomePage() {
    // Referência para controlar submissões
    const isSubmittingRef = useRef(false);

    // Estados
    const [files, setFiles] = useState({
        corpx: null,
        itau: null,
        digital: null,
        generico: null,
    });
    const [multipleFiles, setMultipleFiles] = useState([]);
    const [responseData, setResponseData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isEfetivando, setIsEfetivando] = useState(false);

    // Reset completo de estados
    const resetAllStates = () => {
        isSubmittingRef.current = false;
        setIsLoading(false);
        setIsEfetivando(false);
        setResponseData(null);
        setError(null);
    };

    // Limpar flag de submissão ao desmontar componente
    useEffect(() => {
        return () => {
            isSubmittingRef.current = false;
        };
    }, []);

    // Manipuladores de arquivos
    const handleFileChange = (e, key) => {
        // Remoção de arquivo
        if (e.isRemoval) {
            setFiles(prevFiles => {
                const updatedFiles = { ...prevFiles };
                delete updatedFiles[e.fileId];
                return updatedFiles;
            });
            return;
        }

        // Adição de arquivo
        if (e.target?.files?.length > 0) {
            const file = e.target.files[0];
            setFiles((prev) => ({ ...prev, [key]: file }));
        }
    };

    // Manipulador de múltiplos arquivos
    const handleMultipleFilesChange = (e) => {
        if (e.isRemoval) {
            setMultipleFiles(e.target.files || []);
            return;
        }

        if (e.target?.files) {
            const filesArr = Array.from(e.target.files);
            setMultipleFiles(filesArr);
        }
    };

    // Envio dos arquivos para análise
    const handleSubmit = async (e) => {
        if (e) e.preventDefault();

        // Prevenção de submissões duplicadas
        if (isSubmittingRef.current) return;
        isSubmittingRef.current = true;

        // Validação
        if (multipleFiles.length < 1) {
            setError("Selecione pelo menos um comprovante para análise.");
            isSubmittingRef.current = false;
            return;
        }

        // Preparar dados
        const formData = new FormData();
        multipleFiles.forEach((file) => formData.append("comprovantes", file));

        // Adicionar arquivos individuais, se existirem
        Object.entries(files).forEach(([key, file]) => {
            if (file) formData.append(key, file);
        });

        try {
            setIsLoading(true);
            setError(null);

            // Enviar para API
            const result = await uploadService.enviarArquivos(formData);
            setResponseData(result);
        } catch (error) {
            console.error("Erro ao processar análise:", error);
            setError("Não foi possível processar a análise. Verifique sua conexão ou tente novamente.");
        } finally {
            isSubmittingRef.current = false;
            setIsLoading(false);
        }
    };

    // Iniciar nova análise com reset completo
    const handleButtonClick = (e) => {
        resetAllStates();

        setTimeout(() => {
            handleSubmit(e);
        }, 100);
    };

    // Gerar PDF do relatório
    const generatePDF = () => {
        if (responseData) {
            handleGeneratePDF(
                responseData,
                `relatorio-validacao-${new Date().toISOString().slice(0, 10)}.pdf`
            );
        } else {
            setError("Não há dados disponíveis para gerar o relatório.");
        }
    };

    // Manipulador de efetivação
    const handleEfetivar = (dadosEditados) => {
        console.log("Dados efetivados:", dadosEditados);
        setIsEfetivando(true);
        setTimeout(() => setIsEfetivando(false), 100);
    };

    // Controles de UI
    const hasResults = Boolean(responseData);
    const shouldDisableActions = isLoading || isEfetivando;

    return (
        <div className={styles.container}>
            <header className={styles.pageHeader}>
                <div className={styles.headerContent}>
                    <h1 className={styles.title}>Análise de Transferências Pix</h1>
                    <p className={styles.subtitle}>
                        Faça upload dos comprovantes e arquivos para validação automática.
                    </p>
                </div>
            </header>

            {error && (
                <div className={styles.errorMessage}>
                    <AlertTriangle size={18} className={styles.errorIcon} />
                    <span>{error}</span>
                </div>
            )}

            <div className={styles.contentLayout}>
                {/* Seção de Upload */}
                <section className={styles.uploadSection}>
                    <FileUpload
                        files={files}
                        multipleFiles={multipleFiles}
                        onFileChange={handleFileChange}
                        onMultipleFilesChange={handleMultipleFilesChange}
                    />
                </section>

                {/* Seção de Resultados */}
                <section className={styles.resultSection}>
                    {isLoading ? (
                        <div className={styles.emptyResults}>
                            <InlineLoading
                                message="Processando arquivos..."
                                size="large"
                                theme="primary"
                                variation="dots"
                            />
                        </div>
                    ) : hasResults ? (
                        <ResultSection
                            validos={responseData.validos || []}
                            invalidos={responseData.invalidos || []}
                            onEfetivar={handleEfetivar}
                        />
                    ) : (
                        <div className={styles.emptyResults}>
                            <FileText size={56} className={styles.emptyIcon} />
                            <p className={styles.emptyText}>
                                Os resultados da análise serão exibidos aqui após o processamento.
                            </p>
                        </div>
                    )}
                </section>
            </div>

            {/* Ações */}
            <div className={styles.actions}>
                <button
                    type="button"
                    className={`${styles.button} ${styles.primaryButton}`}
                    onClick={handleButtonClick}
                    disabled={shouldDisableActions}
                >
                    {isLoading ? (
                        <InlineLoading.Spinner theme="transparent" />
                    ) : (
                        <>
                            <UploadCloud size={18} className={styles.buttonIcon} />
                            Processar Análise
                        </>
                    )}
                </button>

                <button
                    type="button"
                    className={`${styles.button} ${styles.secondaryButton}`}
                    onClick={generatePDF}
                    disabled={!hasResults || shouldDisableActions}
                >
                    <FileCheck size={18} className={styles.buttonIcon} />
                    Exportar Relatório
                </button>
            </div>
        </div>
    );
}

export default HomePage;