# Usar uma imagem base para Node.js
FROM node:18

# Definir o diretório de trabalho dentro do container
WORKDIR /usr/src/app

# Copiar apenas os arquivos de dependências primeiro (para otimizar o cache do Docker)
COPY package*.json ./

# Instalar as dependências
RUN npm install

# Copiar todo o restante do código para o diretório de trabalho do container
COPY . .

# Expor a porta utilizada pela aplicação
EXPOSE 3000

# Comando para iniciar o servidor
CMD ["npm", "start"]
