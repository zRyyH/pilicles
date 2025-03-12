import React, { useState, useRef, useEffect } from 'react';
import FileUpload from '../components/FileUpload';
import ResultSection from '../components/ResultSection';
import LoadingOverlay from '../components/LoadingOverlay';
import { handleGeneratePDF } from '../utils/pdfGenerator';
import { uploadService } from '../services/apiService';
import styles from './HomePage.module.css';

function HomePage() {
    // Referência para controlar submissões
    const isSubmittingRef = useRef(false);
    
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
    
    // Reset da flag de submissão em caso de desmontagem
    useEffect(() => {
        return () => {
            isSubmittingRef.current = false;
        };
    }, []);

    const handleFileChange = (e, key) => {
        // Verificar se é uma requisição de remoção
        if (e.isRemoval) {
            setFiles(prevFiles => {
                const updatedFiles = { ...prevFiles };
                delete updatedFiles[e.fileId];
                return updatedFiles;
            });
            return;
        }

        // Processamento normal para adição de arquivo
        if (e.target && e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            setFiles((prev) => ({ ...prev, [key]: file }));
        }
    };

    const handleMultipleFilesChange = (e) => {
        // Verificar se é uma operação de remoção
        if (e.isRemoval) {
            setMultipleFiles(e.target.files || []);
            return;
        }

        // Processamento normal
        if (e.target && e.target.files) {
            const filesArr = Array.from(e.target.files);
            setMultipleFiles(filesArr);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Verificar se já está em submissão
        console.log("Clique no botão Processar Análise. isSubmittingRef:", isSubmittingRef.current, "isLoading:", isLoading);
        
        // Prevenir submissões concorrentes
        if (isSubmittingRef.current === true || isLoading === true) {
            console.log("Processamento já em andamento, ignorando clique");
            return;
        }
        
        // Marcar início do processo
        isSubmittingRef.current = true;
        console.log("Iniciando processamento da análise");
        
        if (multipleFiles.length < 1) {
            setError("Você deve selecionar pelo menos 1 comprovante.");
            isSubmittingRef.current = false;
            return;
        }

        const formData = new FormData();
        multipleFiles.forEach((file) => formData.append("comprovantes", file));
        if (files.corpx) formData.append("corpx", files.corpx);
        if (files.itau) formData.append("itau", files.itau);
        if (files.digital) formData.append("digital", files.digital);
        if (files.generico) formData.append("generico", files.generico);

        try {
            setIsLoading(true);
            setError(null);
            const result = await uploadService.enviarArquivos(formData);
            setResponseData(result);
            console.log("Análise processada com sucesso");
        } catch (error) {
            console.error("Erro ao processar análise:", error);
            setError("Erro ao enviar os arquivos. Verifique sua conexão ou tente novamente.");
        } finally {
            // Garantir que ambos os estados sejam redefinidos
            setIsLoading(false);
            isSubmittingRef.current = false;
            console.log("Finalizado processamento, isSubmittingRef redefinido para:", isSubmittingRef.current);
        }
    };

    // Função simples para garantir que o botão sempre funcione
    const handleButtonClick = (e) => {
        console.log("Botão clicado");
        // Garantir que isSubmittingRef esteja correto antes de chamar handleSubmit
        if (isSubmittingRef.current) {
            isSubmittingRef.current = false;
        }
        handleSubmit(e);
    };

    const generatePDF = () => {
        if (responseData) {
            handleGeneratePDF(responseData, `relatorio-validacao-${new Date().toISOString().slice(0, 10)}.pdf`);
        } else {
            setError("Sem dados para gerar relatório.");
        }
    };

    // Função para efetivar alterações
    const handleEfetivar = (dadosEditados) => {
        console.log("Dados para efetivar:", dadosEditados);
        setIsEfetivando(true);
        setTimeout(() => setIsEfetivando(false), 100);
    };

    // Mostra o overlay de carregamento apenas durante o carregamento inicial dos dados
    const showLoadingOverlay = isLoading && !responseData;

    // Os botões são desativados apenas durante carregamento
    // Removida a dependência de isSubmittingRef para shouldDisableActions
    const shouldDisableActions = isLoading || isEfetivando;

    return (
        <div className={styles.container}>
            {showLoadingOverlay && <LoadingOverlay />}

            <div className={styles.pageHeader}>
                <h2>Analisar transferências Pix</h2>
                <p className={styles.subtitle}>
                    Selecione seus comprovantes e extratos para análise e validação.
                </p>
            </div>

            {error && <div className={styles.errorMessage}>{error}</div>}

            <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
                <div className={styles.flexContainer}>
                    <div className={styles.uploadColumn}>
                        <FileUpload
                            files={files}
                            multipleFiles={multipleFiles}
                            onFileChange={handleFileChange}
                            onMultipleFilesChange={handleMultipleFilesChange}
                        />
                    </div>

                    <div className={styles.resultColumn}>
                        {responseData && (
                            <ResultSection
                                validos={responseData.validos || []}
                                invalidos={responseData.invalidos || []}
                                onEfetivar={handleEfetivar}
                            />
                        )}
                    </div>
                </div>

                <div className={styles.buttonGroup}>
                    <button
                        type="button" // Alterado para button para evitar submissão automática
                        className={`${styles.button} ${styles.primaryButton} ${styles.animateItem}`}
                        onClick={handleButtonClick} // Usando o novo handler
                        disabled={shouldDisableActions}
                    >
                        {isLoading ? 'Processando...' : 'Processar Análise'}
                    </button>
                    <button
                        type="button"
                        className={`${styles.button} ${styles.secondaryButton} ${styles.animateItem}`}
                        onClick={generatePDF}
                        disabled={!responseData || shouldDisableActions}
                    >
                        Exportar Relatório PDF
                    </button>
                </div>
            </form>
        </div>
    );
}

export default HomePage;