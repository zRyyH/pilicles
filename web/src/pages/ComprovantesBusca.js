import React, { useState, useEffect } from 'react';
import styles from './ComprovantesBusca.module.css';
import { comprovantesService } from '../services/apiService';
import { handleGeneratePDF } from '../utils/pdfGenerator';

function ComprovantesBusca() {
    const [nomeCliente, setNomeCliente] = useState('');
    const [comprovantes, setComprovantes] = useState([]);
    const [comprovantesFiltrados, setComprovantesFiltrados] = useState([]);
    const [mensagem, setMensagem] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

    // Estados para filtros
    const [filtroData, setFiltroData] = useState('');
    const [filtroValor, setFiltroValor] = useState('');
    const [filtroBanco, setFiltroBanco] = useState('');
    const [filtroStatus, setFiltroStatus] = useState('');

    // Estado para ordenação
    const [ordenacao, setOrdenacao] = useState({ campo: 'nome', ordem: 'asc' });

    // Lista de bancos para o filtro
    const [listaBancos, setListaBancos] = useState([]);

    const handleBuscar = async (e) => {
        e.preventDefault();
        if (!nomeCliente.trim()) {
            setError('Por favor, digite o nome do cliente para buscar.');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await comprovantesService.buscarPorNome(nomeCliente);
            setComprovantes(response.comprovantes);
            setComprovantesFiltrados(response.comprovantes);
            setMensagem(response.message);
            setError(null);

            // Extrair lista única de bancos para o filtro
            const bancos = [...new Set(response.comprovantes.map(comp => comp.banco))];
            setListaBancos(bancos);
        } catch (err) {
            setError('Erro ao buscar comprovantes. Verifique sua conexão ou tente novamente mais tarde.');
            setComprovantes([]);
            setComprovantesFiltrados([]);
            setMensagem('');
            console.error('Erro na busca:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleExcluir = async (id) => {
        if (window.confirm('Tem certeza que deseja excluir este comprovante?')) {
            try {
                await comprovantesService.excluir(id);
                const comprovantesFiltrados = comprovantes.filter(comprovante => comprovante.id !== id);
                setComprovantes(comprovantesFiltrados);
                aplicarFiltrosEOrdenacao(comprovantesFiltrados);
                setMensagem(`Comprovante #${id} excluído com sucesso.`);
            } catch (err) {
                setError(`Erro ao excluir comprovante #${id}. Tente novamente.`);
                console.error('Erro na exclusão:', err);
            }
        }
    };

    const handleValidar = async (id) => {
        try {
            await comprovantesService.validar(id);
            const comprovantesAtualizados = comprovantes.map(comprovante =>
                comprovante.id === id
                    ? { ...comprovante, status: 'valido' }
                    : comprovante
            );
            setComprovantes(comprovantesAtualizados);
            aplicarFiltrosEOrdenacao(comprovantesAtualizados);
            setMensagem(`Comprovante #${id} validado com sucesso.`);
        } catch (err) {
            setError(`Erro ao validar comprovante #${id}. Tente novamente.`);
            console.error('Erro na validação:', err);
        }
    };

    // Função para aplicar os filtros nos comprovantes
    const aplicarFiltrosEOrdenacao = (listaComprovantes = comprovantes) => {
        let resultados = [...listaComprovantes];

        // Aplicar filtro de data
        if (filtroData) {
            const dataFiltro = new Date(filtroData);
            resultados = resultados.filter(comp => {
                const dataComp = new Date(comp.data);
                return dataComp.toISOString().split('T')[0] === dataFiltro.toISOString().split('T')[0];
            });
        }

        // Aplicar filtro de valor
        if (filtroValor) {
            const valorNumerico = parseFloat(filtroValor.replace(/[^0-9,.-]/g, '').replace(',', '.'));
            resultados = resultados.filter(comp => {
                const valorComp = parseFloat(comp.valor);
                return valorComp === valorNumerico;
            });
        }

        // Aplicar filtro de banco
        if (filtroBanco) {
            resultados = resultados.filter(comp => comp.banco === filtroBanco);
        }

        // Aplicar filtro de status
        if (filtroStatus) {
            resultados = resultados.filter(comp => comp.status === filtroStatus);
        }

        // Aplicar ordenação
        const { campo, ordem } = ordenacao;
        resultados.sort((a, b) => {
            let valorA, valorB;

            // Determinar os valores com base no campo de ordenação
            if (campo === 'nome') {
                valorA = a.nome.toLowerCase();
                valorB = b.nome.toLowerCase();
            } else if (campo === 'valor') {
                valorA = parseFloat(a.valor);
                valorB = parseFloat(b.valor);
            } else if (campo === 'data') {
                valorA = new Date(a.data).getTime();
                valorB = new Date(b.data).getTime();
            } else if (campo === 'status') {
                // Para status, 'valido' vem antes de 'invalido' em ordem ascendente
                valorA = a.status === 'valido' ? 0 : 1;
                valorB = b.status === 'valido' ? 0 : 1;
            }

            // Aplicar a ordenação ascendente ou descendente
            if (ordem === 'asc') {
                return valorA > valorB ? 1 : -1;
            } else {
                return valorA < valorB ? 1 : -1;
            }
        });

        setComprovantesFiltrados(resultados);
    };

    // Efeito para aplicar filtros e ordenação quando os estados mudam
    useEffect(() => {
        aplicarFiltrosEOrdenacao();
    }, [filtroData, filtroValor, filtroBanco, filtroStatus, ordenacao]);

    // Função para alterar a ordenação
    const handleOrdenar = (campo) => {
        setOrdenacao(prev => {
            if (prev.campo === campo) {
                // Se clicar no mesmo campo, alterna a ordem
                return { campo, ordem: prev.ordem === 'asc' ? 'desc' : 'asc' };
            } else {
                // Se clicar em um campo diferente, usa ordem ascendente
                return { campo, ordem: 'asc' };
            }
        });
    };

    // Função para limpar todos os filtros
    const handleLimparFiltros = () => {
        setFiltroData('');
        setFiltroValor('');
        setFiltroBanco('');
        setFiltroStatus('');
        setComprovantesFiltrados(comprovantes);
    };

    const formatarData = (dataString) => {
        const data = new Date(dataString);
        return data.toLocaleDateString('pt-BR');
    };

    const formatarValor = (valor) => {
        return parseFloat(valor).toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        });
    };

    const handleGerarPDF = () => {
        setIsGeneratingPDF(true);

        try {
            // Preparar dados no formato esperado pelo pdfGenerator
            const dadosFormatados = {
                validos: [
                    {
                        comprovante: comprovantesFiltrados.filter(comp => comp.status === 'valido')
                            .map(comp => ({
                                nome: comp.nome,
                                valor: comp.valor,
                                data: comp.data,
                                banco: comp.banco
                            }))
                    }
                ],
                invalidos: [
                    {
                        comprovante: comprovantesFiltrados.filter(comp => comp.status !== 'valido')
                            .map(comp => ({
                                nome: comp.nome,
                                valor: comp.valor,
                                data: comp.data,
                                banco: comp.banco
                            }))
                    }
                ]
            };

            // Gerar o PDF utilizando a utilidade compartilhada
            handleGeneratePDF(dadosFormatados, `comprovantes-${nomeCliente.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().slice(0, 10)}.pdf`);

            setMensagem(prevMensagem => prevMensagem + " Relatório PDF gerado com sucesso.");
        } catch (err) {
            setError("Erro ao gerar o PDF. Tente novamente.");
            console.error('Erro ao gerar PDF:', err);
        } finally {
            setIsGeneratingPDF(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2>Busca de Comprovantes</h2>
                <p>Localize comprovantes por nome de cliente</p>
            </div>

            <div className={styles.searchSection}>
                <form onSubmit={handleBuscar} className={styles.searchForm}>
                    <div className={styles.inputGroup}>
                        <input
                            type="text"
                            value={nomeCliente}
                            onChange={(e) => setNomeCliente(e.target.value)}
                            placeholder="Digite o nome do cliente"
                            className={styles.searchInput}
                        />
                        <button type="submit" className={styles.searchButton} disabled={isLoading}>
                            {isLoading ? 'Buscando...' : 'Buscar'}
                        </button>
                    </div>
                    {error && <div className={styles.errorMessage}>{error}</div>}
                </form>
            </div>

            {isLoading && (
                <div className={styles.loadingContainer}>
                    <div className={styles.loader}></div>
                    <p>Buscando comprovantes...</p>
                </div>
            )}

            {!isLoading && mensagem && (
                <div className={styles.resultInfo}>
                    <h3>{mensagem}</h3>
                </div>
            )}

            {!isLoading && comprovantes.length > 0 && (
                <>
                    <div className={styles.filtrosContainer}>
                        <div className={styles.filtros}>
                            <div className={styles.filtroItem}>
                                <label htmlFor="filtroData">Data:</label>
                                <input
                                    type="date"
                                    id="filtroData"
                                    value={filtroData}
                                    onChange={(e) => setFiltroData(e.target.value)}
                                    className={styles.filtroInput}
                                />
                            </div>
                            <div className={styles.filtroItem}>
                                <label htmlFor="filtroValor">Valor (R$):</label>
                                <input
                                    type="text"
                                    id="filtroValor"
                                    value={filtroValor}
                                    onChange={(e) => setFiltroValor(e.target.value)}
                                    placeholder="Ex: 1000,00"
                                    className={styles.filtroInput}
                                />
                            </div>
                            <div className={styles.filtroItem}>
                                <label htmlFor="filtroBanco">Banco:</label>
                                <select
                                    id="filtroBanco"
                                    value={filtroBanco}
                                    onChange={(e) => setFiltroBanco(e.target.value)}
                                    className={styles.filtroSelect}
                                >
                                    <option value="">Todos</option>
                                    {listaBancos.map((banco, index) => (
                                        <option key={index} value={banco}>{banco}</option>
                                    ))}
                                </select>
                            </div>
                            <div className={styles.filtroItem}>
                                <label htmlFor="filtroStatus">Status:</label>
                                <select
                                    id="filtroStatus"
                                    value={filtroStatus}
                                    onChange={(e) => setFiltroStatus(e.target.value)}
                                    className={styles.filtroSelect}
                                >
                                    <option value="">Todos</option>
                                    <option value="valido">Válidos</option>
                                    <option value="invalido">Inválidos</option>
                                </select>
                            </div>
                            <button
                                onClick={handleLimparFiltros}
                                className={styles.limparFiltrosButton}
                            >
                                Limpar Filtros
                            </button>
                        </div>
                    </div>

                    <div className={styles.actionBar}>
                        <button
                            onClick={handleGerarPDF}
                            className={styles.pdfButton}
                            disabled={isGeneratingPDF}
                        >
                            {isGeneratingPDF ? 'Gerando PDF...' : 'Gerar Relatório PDF'}
                        </button>
                    </div>

                    <div className={styles.tableContainer}>
                        <table className={styles.comprovanteTable}>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th onClick={() => handleOrdenar('nome')} className={styles.ordenavel}>
                                        Cliente {ordenacao.campo === 'nome' && (
                                            <span className={styles.setaOrdenacao}>
                                                {ordenacao.ordem === 'asc' ? '▲' : '▼'}
                                            </span>
                                        )}
                                    </th>
                                    <th onClick={() => handleOrdenar('valor')} className={styles.ordenavel}>
                                        Valor {ordenacao.campo === 'valor' && (
                                            <span className={styles.setaOrdenacao}>
                                                {ordenacao.ordem === 'asc' ? '▲' : '▼'}
                                            </span>
                                        )}
                                    </th>
                                    <th onClick={() => handleOrdenar('data')} className={styles.ordenavel}>
                                        Data {ordenacao.campo === 'data' && (
                                            <span className={styles.setaOrdenacao}>
                                                {ordenacao.ordem === 'asc' ? '▲' : '▼'}
                                            </span>
                                        )}
                                    </th>
                                    <th>Banco</th>
                                    <th onClick={() => handleOrdenar('status')} className={styles.ordenavel}>
                                        Status {ordenacao.campo === 'status' && (
                                            <span className={styles.setaOrdenacao}>
                                                {ordenacao.ordem === 'asc' ? '▲' : '▼'}
                                            </span>
                                        )}
                                    </th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {comprovantesFiltrados.length > 0 ? (
                                    comprovantesFiltrados.map((comprovante) => (
                                        <tr
                                            key={comprovante.id}
                                            className={comprovante.status === 'invalido' ? styles.rowInvalido : ''}
                                        >
                                            <td>{comprovante.id}</td>
                                            <td>{comprovante.nome}</td>
                                            <td>{formatarValor(comprovante.valor)}</td>
                                            <td>{formatarData(comprovante.data)}</td>
                                            <td>{comprovante.banco}</td>
                                            <td>
                                                <span className={
                                                    comprovante.status === 'valido'
                                                        ? styles.statusValido
                                                        : styles.statusInvalido
                                                }>
                                                    {comprovante.status === 'valido' ? 'Válido' : 'Inválido'}
                                                </span>
                                            </td>
                                            <td className={styles.actionButtons}>
                                                {comprovante.status !== 'valido' && (
                                                    <button
                                                        onClick={() => handleValidar(comprovante.id)}
                                                        className={styles.validarButton}
                                                        title="Validar Comprovante"
                                                    >
                                                        Validar
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleExcluir(comprovante.id)}
                                                    className={styles.excluirButton}
                                                    title="Excluir Comprovante"
                                                >
                                                    Excluir
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className={styles.nenhumResultado}>
                                            Nenhum comprovante encontrado com os filtros aplicados.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            {!isLoading && mensagem && comprovantes.length === 0 && (
                <div className={styles.noResults}>
                    <p>Nenhum comprovante encontrado para o cliente informado.</p>
                </div>
            )}
        </div>
    );
}

export default ComprovantesBusca;