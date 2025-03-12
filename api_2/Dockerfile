# Usa a imagem oficial do Node.js 22 como base
FROM node:22

# Define o diretório de trabalho dentro do container
WORKDIR /app

# Copia os arquivos de dependências para o container
COPY package.json package-lock.json ./

# Instala as dependências em modo de produção
RUN npm install

# Copia o restante dos arquivos da aplicação
COPY . .

# Expõe a porta do servidor
EXPOSE 4000

# Comando para iniciar a aplicação
CMD ["node", "server.js"]