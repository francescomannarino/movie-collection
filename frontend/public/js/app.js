// Main Application Entry Point
class MovieCollectionApp {
    constructor() {
        this.isOnline = navigator.onLine;
        this.retryAttempts = 0;
        this.maxRetryAttempts = 3;
    }

    // Inizializzazione dell'applicazione
    async init() {
        console.log('🎬 Inizializzazione Movie Collection App...');
        
        try {
            // Mostra loading iniziale
            this.showInitialLoading();
            
            // Controlla connessione al server
            await this.checkServerConnection();
            
            // Inizializza UI components
            this.initializeUI();
            
            // Inizializza event listeners
            this.initializeEventListeners();
            
            // Carica contenuto iniziale
            await this.loadInitialContent();
            
            // Nascondi loading
            this.hideInitialLoading();
            
            console.log('✅ App inizializzata con successo');
            showToast('Applicazione caricata correttamente!', 'success');
            
        } catch (error) {
            console.error('❌ Errore inizializzazione app:', error);
            this.handleInitializationError(error);
        }
    }

    showInitialLoading() {
        // Invece di sovrascrivere tutto il DOM, aggiungi solo un overlay
        const overlay = document.createElement('div');
        overlay.id = 'app-loading-overlay';
        overlay.innerHTML = `
            <div style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(248, 250, 252, 0.95);
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                z-index: 9999;
                backdrop-filter: blur(3px);
            ">
                <div style="text-align: center;">
                    <i class="fas fa-film" style="font-size: 4rem; color: #2563eb; margin-bottom: 1rem;"></i>
                    <h1 style="font-size: 2rem; margin-bottom: 0.5rem; color: #1e293b;">Movie Collection</h1>
                    <p style="color: #64748b; margin-bottom: 2rem;">Caricamento in corso...</p>
                    <div class="spinner" style="
                        width: 40px;
                        height: 40px;
                        border: 4px solid #e2e8f0;
                        border-top-color: #2563eb;
                        border-radius: 50%;
                        animation: spin 1s linear infinite;
                        margin: 0 auto;
                    "></div>
                </div>
            </div>
            <style>
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            </style>
        `;
        document.body.appendChild(overlay);
    }

    hideInitialLoading() {
        // Rimuovi l'overlay di loading
        const overlay = document.getElementById('app-loading-overlay');
        if (overlay) {
            overlay.remove();
        }
    }

    async checkServerConnection() {
        try {
            const health = await api.healthCheck();
            if (health.status !== 'OK') {
                throw new Error('Server non disponibile');
            }
            console.log('✅ Connessione server OK');
        } catch (error) {
            console.error('❌ Errore connessione server:', error);
            
            if (this.retryAttempts < this.maxRetryAttempts) {
                this.retryAttempts++;
                console.log(`🔄 Tentativo ${this.retryAttempts}/${this.maxRetryAttempts}...`);
                await new Promise(resolve => setTimeout(resolve, 2000));
                return this.checkServerConnection();
            }
            
            throw new Error('Impossibile connettersi al server dopo 3 tentativi');
        }
    }

    initializeUI() {
        // Inizializza componenti UI
        ui.initNavigation();
        ui.initEventListeners();
        ui.initLibraryFilters();
        ui.initBackup();
        
        console.log('✅ UI components inizializzati');
    }



    initializeEventListeners() {
        // Event listener per connessione online/offline
        window.addEventListener('online', () => {
            this.isOnline = true;
            showToast('Connessione ripristinata', 'success');
            console.log('🌐 Connessione online ripristinata');
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
            showToast('Connessione persa - Modalità offline', 'warning');
            console.log('📡 Connessione offline');
        });

        // Event listener per chiusura modal con ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const modal = document.getElementById('movieModal');
                if (modal.classList.contains('active')) {
                    ui.closeModal();
                }
            }
        });

        // Event listener per click fuori dal modal
        const movieModal = document.getElementById('movieModal');
        if (movieModal) {
            movieModal.addEventListener('click', (e) => {
                if (e.target.id === 'movieModal') {
                    ui.closeModal();
                }
            });
        }

        // Gestione errori globali
        window.addEventListener('error', (e) => {
            console.error('❌ Errore JavaScript:', e.error);
            showToast('Si è verificato un errore imprevisto', 'error');
        });

        // Gestione errori Promise non catturate
        window.addEventListener('unhandledrejection', (e) => {
            console.error('❌ Promise rejection non gestita:', e.reason);
            showToast('Si è verificato un errore di rete', 'error');
        });

        console.log('✅ Event listeners inizializzati');
    }

    async loadInitialContent() {
        try {
            // Carica contenuto della sezione attiva (default: library)
            await ui.loadSectionContent('library');
            
            // Aggiorna statistiche header
            await ui.updateHeaderStats();
            
            console.log('✅ Contenuto iniziale caricato');
        } catch (error) {
            console.error('❌ Errore caricamento contenuto iniziale:', error);
            // Non bloccare l'app se il contenuto iniziale fallisce
            showToast('Errore nel caricamento iniziale - Riprova più tardi', 'warning');
        }
    }

    handleInitializationError(error) {
        document.body.innerHTML = `
            <div style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: #f8fafc;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                text-align: center;
                padding: 2rem;
            ">
                <i class="fas fa-exclamation-triangle" style="font-size: 4rem; color: #dc2626; margin-bottom: 1rem;"></i>
                <h1 style="font-size: 2rem; margin-bottom: 1rem; color: #1e293b;">Errore di Inizializzazione</h1>
                <p style="color: #64748b; margin-bottom: 2rem; max-width: 500px;">
                    Si è verificato un errore durante l'avvio dell'applicazione. 
                    Verifica che il server sia in esecuzione e riprova.
                </p>
                <div style="margin-bottom: 2rem; padding: 1rem; background: #fee2e2; border-radius: 8px; color: #dc2626;">
                    ${error.message}
                </div>
                <button id="retryButton" style="
                    padding: 0.75rem 1.5rem;
                    background: #2563eb;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-weight: 500;
                    cursor: pointer;
                    font-size: 1rem;
                ">
                    <i class="fas fa-redo"></i> Riprova
                </button>
            </div>
        `;
        
        // Aggiungi event listener in modo sicuro
        const retryButton = document.getElementById('retryButton');
        if (retryButton) {
            retryButton.addEventListener('click', () => {
                location.reload();
            });
        }
    }

    // Metodo per gestire errori di rete
    handleNetworkError(error) {
        if (!this.isOnline) {
            showToast('Nessuna connessione internet', 'error');
            return;
        }

        if (error.message.includes('fetch')) {
            showToast('Errore di connessione al server', 'error');
        } else {
            showToast('Errore di rete imprevisto', 'error');
        }
    }

    // Metodo per debug (solo in development)
    enableDebugMode() {
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            window.movieApp = this;
            window.api = api;
            window.ui = ui;
            console.log('🐛 Debug mode abilitato - Oggetti disponibili: movieApp, api, ui');
        }
    }

    // Metodo per cleanup quando l'app viene chiusa
    cleanup() {
        console.log('🧹 Cleanup applicazione...');
        
        // Pulisci cache API
        api.clearCache();
        
        // Rimuovi event listeners se necessario
        // (in questo caso sono gestiti automaticamente dal browser)
        
        console.log('✅ Cleanup completato');
    }
}

// Funzione per inizializzare l'app
async function initializeApp() {
    console.log('📄 DOM caricato, inizializzazione app...');
    
    // Aspetta un frame per assicurarsi che il DOM sia completamente renderizzato
    await new Promise(resolve => requestAnimationFrame(resolve));
    
    // Crea istanza dell'applicazione
    const movieApp = new MovieCollectionApp();
    
    // Abilita debug mode in development
    movieApp.enableDebugMode();
    
    // Inizializza l'applicazione
    await movieApp.init();
    
    // Gestisci cleanup quando la finestra viene chiusa
    window.addEventListener('beforeunload', () => {
        movieApp.cleanup();
    });
    
    // Rendi l'app disponibile globalmente per debug
    window.movieApp = movieApp;
}

// Inizializzazione quando il DOM è pronto
if (document.readyState === 'loading') {
    // DOM ancora in caricamento, aspetta DOMContentLoaded
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    // DOM già caricato, inizializza immediatamente
    initializeApp();
}

// Service Worker per cache offline (opzionale)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Registra service worker solo in produzione
        if (window.location.protocol === 'https:' || window.location.hostname === 'localhost') {
            navigator.serviceWorker.register('/sw.js')
                .then((registration) => {
                    console.log('✅ Service Worker registrato:', registration.scope);
                })
                .catch((error) => {
                    console.log('❌ Service Worker fallito:', error);
                });
        }
    });
}
