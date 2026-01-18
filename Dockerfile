# Imagen base: Node.js 22 en Alpine (liviana y compatible)
FROM node:22-alpine

# Crear directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias primero (aprovecha cache de Docker)
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto del codigo fuente
COPY . .

# Puerto que expone la aplicacion
EXPOSE 8080

# Comando para iniciar la aplicacion
CMD ["npm", "start"]
