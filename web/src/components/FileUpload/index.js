import React from 'react';
import { useDropzone } from 'react-dropzone';
import { File, X, Upload } from 'lucide-react';
import styles from './FileUpload.module.css';

// Componente para um único tipo de arquivo
const SingleFileUploader = ({ type, file, onFileChange }) => {
  const handleSingleFile = (acceptedFiles) => {
    if (acceptedFiles.length && onFileChange) {
      onFileChange({ target: { files: [acceptedFiles[0]] } }, type);
    }
  };

  const removeSingleFile = (e) => {
    e.stopPropagation();
    if (onFileChange) onFileChange({ isRemoval: true, fileId: type });
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: handleSingleFile,
    multiple: false
  });

  return (
    <div className={styles.inputGroup}>
      <label className={styles.label}>{type} (opcional)</label>

      <div {...getRootProps()} className={styles.dropzone}>
        <input {...getInputProps()} accept='.xlsx, .pdf' />
        <p className={styles.dropzoneText}>Selecionar arquivo</p>
      </div>

      {file && (
        <div className={styles.fileItem}>
          <File size={14} className={styles.icon} />
          <span className={styles.fileName}>{file.name}</span>
          <button onClick={removeSingleFile} className={styles.removeButton}>
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
};

const FileUpload = ({ files = {}, multipleFiles = [], onFileChange, onMultipleFilesChange }) => {
  // Tipos de arquivo
  const fileTypes = ['corpx', 'itau', 'digital', 'generico'];

  // Upload de múltiplos arquivos
  const handleMultipleFiles = (acceptedFiles) => {
    if (onMultipleFilesChange) {
      onMultipleFilesChange({
        target: { files: [...(multipleFiles || []), ...acceptedFiles] }
      });
    }
  };

  // Remover múltiplos arquivos
  const removeMultipleFile = (index, e) => {
    e.stopPropagation();
    const newFiles = [...multipleFiles];
    newFiles.splice(index, 1);
    if (onMultipleFilesChange) {
      onMultipleFilesChange({ target: { files: newFiles }, isRemoval: true });
    }
  };

  // Dropzone para múltiplos arquivos
  const { getRootProps, getInputProps } = useDropzone({
    onDrop: handleMultipleFiles,
    multiple: true
  });

  return (
    <div>
      {/* Arquivos individuais */}
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.header}>
            <File className={styles.icon} size={16} />
            <h3 className={styles.title}>Arquivos Individuais</h3>
          </div>

          <div className={styles.grid}>
            {fileTypes.map(type => (
              <SingleFileUploader
                key={type}
                type={type}
                file={files[type]}
                onFileChange={onFileChange}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Múltiplos arquivos */}
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.header}>
            <Upload className={styles.icon} size={16} />
            <h3 className={styles.title}>
              Comprovantes
              {multipleFiles?.length > 0 && (
                <span className={styles.counter}>
                  {multipleFiles.length}
                </span>
              )}
            </h3>
          </div>

          <div {...getRootProps()} className={`${styles.dropzone} ${styles.dropzoneMulti}`}>
            <input {...getInputProps()} accept='.png, .jpg, .jpeg, .pdf' />
            <p className={styles.dropzoneText}>Arraste arquivos ou clique aqui</p>
          </div>

          {multipleFiles?.length > 0 ? (
            <div className={styles.fileList}>
              {multipleFiles.map((file, idx) => (
                <div key={idx} className={styles.fileItem}>
                  <File size={14} className={styles.icon} />
                  <span className={styles.fileName}>{file.name}</span>
                  <button onClick={e => removeMultipleFile(idx, e)} className={styles.removeButton}>
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className={styles.emptyMessage}>
              Nenhum arquivo selecionado
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileUpload;