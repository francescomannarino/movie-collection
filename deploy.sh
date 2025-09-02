#!/bin/bash

# Script di deploy per Movie Collection WebApp con PM2
# Assicurati di rendere eseguibile: chmod +x deploy.sh

set -e  # Esci se qualche comando fallisce

echo "🎬 Movie Collection WebApp - Deploy Script"
echo "=========================================="

# Colori per output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funzioni helper
print_step() {
    echo -e "${BLUE}📋 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Verifica prerequisiti
print_step "Verificando prerequisiti..."

if ! command -v node &> /dev/null; then
    print_error "Node.js non trovato. Installa Node.js prima di continuare."
    exit 1
fi

if ! command -v npm &> /dev/null; then
    print_error "npm non trovato. Installa npm prima di continuare."
    exit 1
fi

if ! command -v pm2 &> /dev/null; then
    print_error "PM2 non trovato. Installa PM2 con: npm install -g pm2"
    exit 1
fi

print_success "Prerequisiti verificati"

# Aggiorna codice (se in repository git)
if [ -d ".git" ]; then
    print_step "Aggiornando codice dal repository..."
    git pull origin main || {
        print_warning "Impossibile aggiornare da git. Continuando con il codice locale."
    }
else
    print_warning "Non è un repository git. Saltando aggiornamento codice."
fi

# Crea directory logs se non esiste
print_step "Preparando directory..."
mkdir -p logs
print_success "Directory preparate"

# Installa/aggiorna dipendenze
print_step "Installando dipendenze..."
npm ci --only=production
print_success "Dipendenze installate"

# Verifica se PM2 è già in esecuzione con la nostra app
print_step "Verificando stato PM2..."
if pm2 list | grep -q "movie-collection-webapp"; then
    print_step "Applicazione già in esecuzione. Effettuando restart..."
    pm2 restart ecosystem.config.js --env production
    print_success "Applicazione riavviata"
else
    print_step "Avviando nuova istanza dell'applicazione..."
    pm2 start ecosystem.config.js --env production
    print_success "Applicazione avviata"
fi

# Salva configurazione PM2
print_step "Salvando configurazione PM2..."
pm2 save
print_success "Configurazione salvata"

# Verifica status finale
print_step "Verificando status finale..."
echo ""
pm2 status
echo ""

# Mostra log recenti
print_step "Log recenti dell'applicazione:"
pm2 logs movie-collection-webapp --lines 10 --nostream

echo ""
print_success "Deploy completato con successo!"
echo ""
echo -e "${BLUE}📋 Comandi utili:${NC}"
echo "  - Monitoraggio: pm2 monit"
echo "  - Log: pm2 logs movie-collection-webapp"
echo "  - Status: pm2 status"
echo "  - Restart: pm2 restart movie-collection-webapp"
echo "  - Stop: pm2 stop movie-collection-webapp"
echo ""
echo -e "${GREEN}🌐 La tua applicazione dovrebbe essere accessibile su:${NC}"
echo "  - http://localhost:3000"
echo "  - http://$(hostname -I | awk '{print $1}'):3000 (LAN)"
echo ""
