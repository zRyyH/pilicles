import React, { useMemo } from 'react';
import { useDropzone } from 'react-dropzone';
import { File, X, Upload, FileText, AlertCircle } from 'lucide-react';
import styles from './FileUpload.module.css';

// Componente para um único arquivo
const SingleFileUploader = ({ type, file, onFileChange }) => {
  // Configuração do dropzone
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length && onFileChange) {
        onFileChange({ target: { files: [acceptedFiles[0]] } }, type);
      }
    },
    multiple: false
  });

  // Remover arquivo
  const handleRemove = (e) => {
    e.stopPropagation();
    if (onFileChange) onFileChange({ isRemoval: true, fileId: type });
  };

  // Formatação do nome do tipo de arquivo
  const formatTypeName = (name) => {
    // Capitaliza a primeira letra e trata casos especiais
    if (name === 'corpx') return 'CorpX';
    if (name === 'itau') return 'Itaú';
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  return (
    <div className={styles.fileTypeItem}>
      <label className={styles.fileTypeLabel}>{formatTypeName(type)}</label>

      {!file ? (
        <div
          {...getRootProps()}
          className={`${styles.dropzone} ${isDragActive ? styles.dropzoneActive : ''}`}
        >
          <input {...getInputProps()} accept='.xlsx, .pdf' />
          <FileText size={18} className={styles.sectionIcon} />
          <p className={styles.dropzoneText}>Selecionar arquivo</p>
        </div>
      ) : (
        <div className={styles.singleFile}>
          <File size={16} className={styles.fileIcon} />
          <span className={styles.fileName}>{file.name}</span>
          <button onClick={handleRemove} className={styles.removeButton} title="Remover arquivo">
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
};

// Componente para formatação do tamanho do arquivo
const FileSize = ({ bytes }) => {
  const formattedSize = useMemo(() => {
    if (bytes < 1024) return `${bytes} bytes`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }, [bytes]);

  return <span>{formattedSize}</span>;
};

// Componente principal
const FileUpload = ({ files = {}, multipleFiles = [], onFileChange, onMultipleFilesChange }) => {
  // Tipos de arquivo individual
  const fileTypes = ['corpx', 'itau', 'digital', 'generico'];

  // Configuração do dropzone para múltiplos arquivos
  const {
    getRootProps,
    getInputProps,
    isDragActive
  } = useDropzone({
    onDrop: (acceptedFiles) => {
      if (onMultipleFilesChange) {
        onMultipleFilesChange({
          target: { files: [...(multipleFiles || []), ...acceptedFiles] }
        });
      }
    },
    multiple: true
  });

  // Remover arquivo da lista de múltiplos
  const removeMultipleFile = (index, e) => {
    e.stopPropagation();
    const newFiles = [...multipleFiles];
    newFiles.splice(index, 1);

    if (onMultipleFilesChange) {
      onMultipleFilesChange({ target: { files: newFiles }, isRemoval: true });
    }
  };

  // Verificar extensão do arquivo para definir ícone apropriado
  const getFileIcon = (filename) => {
    const ext = filename.split('.').pop().toLowerCase();

    // Ícones específicos baseados na extensão
    switch (ext) {
      case 'pdf':
        return <File size={16} className={styles.fileIcon} />;
      case 'jpg':
      case 'jpeg':
      case 'png':
        return <FileText size={16} className={styles.fileIcon} />;
      default:
        return <File size={16} className={styles.fileIcon} />;
    }
  };

  return (
    <>
      {/* Seção de arquivos individuais */}
      <section className={styles.uploadSection}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>
            <FileText size={18} className={styles.sectionIcon} />
            Arquivos Individuais
          </h3>
        </div>

        <div className={styles.fileTypesGrid}>
          {fileTypes.map(type => (
            <SingleFileUploader
              key={type}
              type={type}
              file={files[type]}
              onFileChange={onFileChange}
            />
          ))}
        </div>
      </section>

      {/* Seção de múltiplos comprovantes */}
      <section className={styles.uploadSection}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>
            <Upload size={18} className={styles.sectionIcon} />
            Comprovantes
            {multipleFiles?.length > 0 && (
              <span className={styles.counter}>{multipleFiles.length}</span>
            )}
          </h3>
        </div>

        <div
          {...getRootProps()}
          className={`${styles.dropzone} ${styles.multiDropzone} ${isDragActive ? styles.dropzoneActive : ''}`}
        >
          <input {...getInputProps()} accept='.png, .jpg, .jpeg, .pdf' />
          <Upload size={24} className={styles.sectionIcon} />
          <p className={styles.dropzoneText}>
            Arraste e solte seus arquivos aqui, ou clique para selecionar
          </p>
        </div>

        {multipleFiles?.length > 0 ? (
          <div className={styles.filesList}>
            {multipleFiles.map((file, idx) => (
              <div key={idx} className={styles.multiFile}>
                <div className={styles.multiFileHeader}>
                  {getFileIcon(file.name)}
                  <span className={styles.multiFileName}>{file.name}</span>
                </div>

                <div className={styles.multiFileInfo}>
                  <FileSize bytes={file.size} />
                </div>

                <div className={styles.multiFileActions}>
                  <button
                    onClick={(e) => removeMultipleFile(idx, e)}
                    className={styles.removeButton}
                    title="Remover arquivo"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.emptyMessage}>
            <AlertCircle size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
            Nenhum arquivo selecionado
          </div>
        )}
      </section>
    </>
  );
};

export default FileUpload;