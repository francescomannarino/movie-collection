# Utilizzare l'immagine ufficiale di Node.js 18 LTS come base
FROM node:18-alpine

# Impostare le variabili d'ambiente
ENV NODE_ENV=production
ENV PORT=3000

# Creare la directory dell'applicazione nel container
WORKDIR /usr/src/app

# Creare un utente non-root per sicurezza
RUN addgroup -g 1001 -S nodejs
RUN adduser -S movieapp -u 1001

# Copiare i file package.json e package-lock.json
COPY package*.json ./

# Installare le dipendenze (solo quelle di produzione)
RUN npm ci --only=production && npm cache clean --force

# Copiare il codice sorgente dell'applicazione
COPY . .

# Creare la directory per i log se necessaria
RUN mkdir -p logs && chown -R movieapp:nodejs logs

# Cambiare ownership dei file all'utente movieapp
RUN chown -R movieapp:nodejs /usr/src/app

# Cambiare all'utente non-root
USER movieapp

# Esporre la porta dell'applicazione
EXPOSE 3000

# Definire il comando di salute per Docker
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Comando per avviare l'applicazione
CMD ["npm", "start"]
