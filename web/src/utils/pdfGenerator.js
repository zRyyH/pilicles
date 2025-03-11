import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatField, mergeComprovantesTransferencias, sanitize } from './formatters';
import config from '../config';

/**
 * Gera um relatório PDF profissional com os dados de comprovantes e transferências
 * @param {Object} responseData - Dados de comprovantes e transferências
 * @param {String} fileName - Nome do arquivo PDF a ser gerado (opcional)
 * @param {Object} options - Opções adicionais para customização do PDF (opcional)
 */
export const handleGeneratePDF = (responseData, fileName = config.pdf.defaultFileName, options = {}) => {
    // Inicializa o documento com orientação landscape para maior largura horizontal
    const doc = new jsPDF({
        orientation: options.orientation || config.pdf.orientation,
        unit: options.unit || 'pt',
        format: options.format || config.pdf.pageSize
    });

    // Configurações de estilo
    const colors = {
        primary: options.primaryColor || config.pdf.defaultColors.primary,
        secondary: options.secondaryColor || config.pdf.defaultColors.secondary,
        success: options.successColor || config.pdf.defaultColors.success,
        danger: options.dangerColor || config.pdf.defaultColors.danger,
        light: options.lightColor || config.pdf.defaultColors.light
    };

    // Título do relatório (customizável)
    const title = options.title || "Relatório de Validação";

    // Cabeçalho do documento
    doc.setFontSize(16);
    doc.setTextColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
    doc.text(title, 40, 40);

    // Data do relatório
    const today = new Date();
    const formattedDate = today.toLocaleDateString('pt-BR');
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Gerado em: ${formattedDate}`, 40, 60);

    // Subtítulo opcional
    if (options.subtitle) {
        doc.setFontSize(11);
        doc.setTextColor(120, 120, 120);
        doc.text(options.subtitle, 40, 80);
    }

    // Linha divisória
    doc.setDrawColor(colors.light[0], colors.light[1], colors.light[2]);
    doc.setLineWidth(1);
    doc.line(40, options.subtitle ? 90 : 70, 555, options.subtitle ? 90 : 70);

    let startY = options.subtitle ? 110 : 90;

    // Função otimizada para construir dados da tabela
    const buildTableData = (registros, isValid) => {
        if (!registros || registros.length === 0) return [];

        return registros.flatMap((item) => {
            const pairs = mergeComprovantesTransferencias(
                item.comprovante,
                item.transferencia
            );

            return pairs.map(({ comprovante, transferencia }) => {
                if (isValid) {
                    return [
                        formatField('nome', comprovante.nome),
                        formatField('valor', comprovante.valor),
                        formatField('data', comprovante.data),
                        formatField('nome', transferencia?.nome),
                        formatField('valor', transferencia?.valor),
                        formatField('data', transferencia?.data),
                        sanitize(transferencia?.banco || comprovante?.banco || '')
                    ];
                } else {
                    return [
                        formatField('nome', comprovante.nome),
                        formatField('valor', comprovante.valor),
                        formatField('data', comprovante.data),
                        sanitize(comprovante.banco || '')
                    ];
                }
            });
        });
    };

    // Função para transformar dados de transferências inválidas
    const buildTransferenciasInvalidasData = (transferencias) => {
        // Garantir que transferencias seja um array
        const transferenciasArray = Array.isArray(transferencias)
            ? transferencias
            : (transferencias && typeof transferencias === 'object')
                ? Object.values(transferencias)
                : [];

        if (transferenciasArray.length === 0) return [];

        return transferenciasArray
            .filter(item => item && typeof item === 'object' && 'nome' in item && 'valor' in item)
            .map(transferencia => [
                formatField('nome', transferencia.nome),
                formatField('valor', transferencia.valor),
                formatField('data', transferencia.data),
                sanitize(transferencia.banco || '')
            ]);
    };

    const validData = buildTableData(responseData.validos || [], true);
    const invalidData = buildTableData(responseData.invalidos || [], false);

    // Adicionar processamento de transferências_invalidas se existirem
    const transferenciasInvalidasData = buildTransferenciasInvalidasData(
        responseData.transferencias_invalidas || []
    );

    // Definição dos cabeçalhos (customizáveis via options)
    const validHeaders = options.validHeaders || [
        'Nome Comp.', 'Valor', 'Data',
        'Nome Transf.', 'Valor', 'Data', 'Banco'
    ];

    const invalidHeaders = options.invalidHeaders || [
        'Nome Comp.', 'Valor', 'Data', 'Banco'
    ];

    // Cabeçalhos para transferências não encontradas
    const transferenciasInvalidasHeaders = options.transferenciasInvalidasHeaders || [
        'Nome', 'Valor', 'Data', 'Banco'
    ];

    // Configurações de tabela melhoradas
    const tableConfig = {
        theme: 'grid',
        headStyles: {
            fillColor: colors.primary,
            textColor: 255,
            fontStyle: 'bold',
            fontSize: 8,
            cellPadding: 4,
            halign: 'center'
        },
        bodyStyles: {
            fontSize: 8,
            cellPadding: 3,
            lineColor: [220, 220, 220]
        },
        alternateRowStyles: {
            fillColor: [249, 249, 249]
        },
        margin: { left: 40, right: 40 },
        columnStyles: {
            1: { halign: 'right' }, // Alinhar valores à direita
            2: { halign: 'center' }, // Centralizar datas
            4: { halign: 'right' }, // Alinhar valores à direita
            5: { halign: 'center' } // Centralizar datas
        },
        didDrawPage: (data) => {
            // Adiciona rodapé com paginação
            const pageCount = doc.internal.getNumberOfPages();
            doc.setFontSize(8);
            doc.setTextColor(150, 150, 150);
            doc.text(
                `Página ${data.pageNumber} de ${pageCount}`,
                data.settings.margin.left,
                doc.internal.pageSize.height - 20
            );

            // Adiciona informações adicionais no rodapé se fornecidas
            if (options.footerText) {
                doc.text(
                    options.footerText,
                    data.settings.margin.left,
                    doc.internal.pageSize.height - 35
                );
            }
        }
    };

    // Seção de itens válidos
    if (validData.length > 0) {
        doc.setFontSize(12);
        doc.setTextColor(colors.success[0], colors.success[1], colors.success[2]);
        doc.text("Registros Válidos", 40, startY);

        // Contador de registros
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(`Total: ${validData.length}`, 150, startY);

        autoTable(doc, {
            ...tableConfig,
            head: [validHeaders],
            body: validData,
            startY: startY + 10
        });

        startY = doc.lastAutoTable.finalY + 25;
    }

    // Seção de itens inválidos
    if (invalidData.length > 0) {
        doc.setFontSize(12);
        doc.setTextColor(colors.danger[0], colors.danger[1], colors.danger[2]);
        doc.text("Registros Inválidos", 40, startY);

        // Contador de registros
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(`Total: ${invalidData.length}`, 160, startY);

        autoTable(doc, {
            ...tableConfig,
            head: [invalidHeaders],
            body: invalidData,
            startY: startY + 10
        });

        startY = doc.lastAutoTable.finalY + 25;
    }

    // Seção de transferências não encontradas
    if (transferenciasInvalidasData.length > 0) {
        doc.setFontSize(12);
        doc.setTextColor(colors.danger[0], colors.danger[1], colors.danger[2]);
        doc.text("Transferências Não Encontradas", 40, startY);

        // Contador de registros
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(`Total: ${transferenciasInvalidasData.length}`, 220, startY);

        autoTable(doc, {
            ...tableConfig,
            head: [transferenciasInvalidasHeaders],
            body: transferenciasInvalidasData,
            startY: startY + 10
        });
    }

    // Adiciona metadados ao PDF
    doc.setProperties({
        title: title,
        subject: options.subject || 'Validação de Comprovantes e Transferências',
        creator: options.creator || 'Sistema de Relatórios',
        author: options.author || 'Sistema'
    });

    // Salva o PDF com o nome fornecido
    doc.save(fileName);
};