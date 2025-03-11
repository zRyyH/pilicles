import React, { useState } from 'react';
import FileUpload from '../components/FileUpload';
import ResultSection from '../components/ResultSection';
import LoadingOverlay from '../components/LoadingOverlay';
import { handleGeneratePDF } from '../utils/pdfGenerator';
import { uploadService } from '../services/apiService';
import styles from './HomePage.module.css';

function HomePage() {
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
    // Adiciona um novo estado para rastrear a aba ativa no ResultSection
    const [activeResultTab, setActiveResultTab] = useState('validos');

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
        if (multipleFiles.length < 1) {
            setError("Você deve selecionar pelo menos 1 comprovante.");
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
            // Reseta para a aba 'validos' quando novos dados são carregados
            setActiveResultTab('validos');
        } catch (error) {
            console.error(error);
            setError("Erro ao enviar os arquivos. Verifique sua conexão ou tente novamente.");
        } finally {
            setIsLoading(false);
        }
    };

    const generatePDF = () => {
        if (responseData) {
            // Usar a mesma função de geração de PDF que é compartilhada com ComprovantesBusca
            handleGeneratePDF(responseData, `relatorio-validacao-${new Date().toISOString().slice(0, 10)}.pdf`);
        } else {
            setError("Sem dados para gerar relatório.");
        }
    };

    // Função para efetivar alterações
    const handleEfetivar = (dadosEditados) => {
        console.log("Dados para efetivar:", dadosEditados);
        setIsEfetivando(true);
        // Após processar a operação:
        setTimeout(() => setIsEfetivando(false), 100);
    };

    // Adiciona um novo manipulador para rastrear mudanças de aba no ResultSection
    const handleTabChange = (tabName) => {
        setActiveResultTab(tabName);
    };

    // CORRIGIDO: Mostra o overlay de carregamento apenas durante o carregamento inicial dos dados,
    // não quando estiver navegando entre as abas no ResultSection
    const showLoadingOverlay = isLoading && !responseData;

    // Determina se os botões de ação devem ser desativados com base na aba atual
    const shouldDisableActions = isLoading || isEfetivando || 
        (activeResultTab !== 'validos' && activeResultTab !== 'invalidos');

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

            <form className={styles.form} onSubmit={handleSubmit}>
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
                                onTabChange={handleTabChange}
                            />
                        )}
                    </div>
                </div>

                <div className={styles.buttonGroup}>
                    <button
                        type="submit"
                        className={`${styles.button} ${styles.primaryButton} ${styles.animateItem}`}
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