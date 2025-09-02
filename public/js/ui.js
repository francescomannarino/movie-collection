// UI Components e utilities
class UIManager {
    constructor() {
        this.currentSection = 'library';
        this.currentPage = 1;
        this.currentSearchQuery = '';
        this.currentSearchPage = 1;
        this.libraryFilters = {
            format: '',
            genre: '',
            search: '',
            year: '',
            sortBy: 'dateAdded',
            sortOrder: 'desc'
        };
    }

    // ============ NAVIGATION ============

    initNavigation() {
        const navButtons = document.querySelectorAll('.nav-btn');
        navButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const section = btn.getAttribute('data-section');
                this.switchSection(section);
            });
        });
    }

    // Inizializza tutti gli event listener per i data-action
    initEventListeners() {
        document.addEventListener('click', (e) => {
            // Cerca l'elemento con data-action più vicino (supporta event delegation)
            const actionElement = e.target.closest('[data-action]');
            if (!actionElement) return;

            const action = actionElement.getAttribute('data-action');
            if (!action) return;

            switch (action) {
                case 'switch-section':
                    const section = actionElement.getAttribute('data-section');
                    this.switchSection(section);
                    break;
                    
                case 'export-data':
                    const format = actionElement.getAttribute('data-format');
                    exportData(format);
                    break;
                    
                case 'select-backup-file':
                    document.getElementById('backupFile').click();
                    break;
                    
                case 'import-data':
                    importData();
                    break;
                    
                case 'close-modal':
                    this.closeModal();
                    break;
                    
                case 'show-movie-modal':
                    const movieId = actionElement.getAttribute('data-movie-id');
                    if (movieId) {
                        this.showMovieModal(movieId);
                    }
                    break;
                    
                case 'library-page':
                    const page = parseInt(actionElement.getAttribute('data-page'));
                    if (page && !actionElement.disabled) {
                        this.goToLibraryPage(page);
                    }
                    break;
                    
                case 'select-suggestion':
                    const title = actionElement.getAttribute('data-title');
                    if (title) {
                        this.selectSuggestion(title);
                    }
                    break;
                    
                case 'add-movie':
                    const tmdbId = parseInt(actionElement.getAttribute('data-tmdb-id'));
                    if (tmdbId) {
                        this.addMovieToCollection(tmdbId);
                    }
                    break;
                    
                case 'search-page':
                    const searchPage = parseInt(actionElement.getAttribute('data-page'));
                    if (searchPage && !actionElement.disabled) {
                        this.goToSearchPage(searchPage);
                    }
                    break;
                    
                case 'edit-formats':
                    const editMovieId = actionElement.getAttribute('data-movie-id');
                    const formatsData = actionElement.getAttribute('data-formats');
                    if (editMovieId && formatsData) {
                        const formats = JSON.parse(formatsData.replace(/&quot;/g, '"'));
                        this.editMovieFormats(editMovieId, formats);
                    }
                    break;
                    
                case 'delete-movie':
                    const deleteMovieId = actionElement.getAttribute('data-movie-id');
                    const movieTitle = actionElement.getAttribute('data-title');
                    if (deleteMovieId && movieTitle) {
                        this.deleteMovie(deleteMovieId, movieTitle);
                    }
                    break;
                    
                case 'save-formats':
                    const saveMovieId = actionElement.getAttribute('data-movie-id');
                    if (saveMovieId) {
                        this.saveMovieFormats(saveMovieId);
                    }
                    break;
                    
                case 'close-toast':
                    const toastElement = actionElement.closest('.toast');
                    if (toastElement) {
                        toastElement.remove();
                    }
                    break;
            }
        });

        // Event listener per il file input del backup
        const backupFileInput = document.getElementById('backupFile');
        if (backupFileInput) {
            backupFileInput.addEventListener('change', (e) => {
                const importBtn = document.getElementById('importBtn');
                if (e.target.files.length > 0) {
                    importBtn.disabled = false;
                } else {
                    importBtn.disabled = true;
                }
            });
        }

        // Event listener per errori di caricamento immagini - solo log, nessun fallback
        document.addEventListener('error', (e) => {
            if (e.target.tagName === 'IMG') {
                console.log('⚠️ Image loading failed:', e.target.src);
                // Non usiamo più fallback - lasciamo che l'immagine mostri il placeholder del browser
            }
        }, true);
    }

    switchSection(sectionName) {
        // Aggiorna bottoni navigazione
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-section') === sectionName) {
                btn.classList.add('active');
            }
        });

        // Aggiorna sezioni
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(sectionName).classList.add('active');

        this.currentSection = sectionName;

        // Carica contenuto della sezione
        this.loadSectionContent(sectionName);
    }

    async loadSectionContent(sectionName) {
        switch (sectionName) {
            case 'library':
                await this.loadLibrary();
                break;
            case 'search':
                this.initSearch();
                break;
            case 'backup':
                await this.loadBackupStats();
                break;
        }
    }

    // ============ LIBRARY SECTION ============

    async loadLibrary(page = 1) {
        const loading = document.getElementById('libraryLoading');
        const empty = document.getElementById('libraryEmpty');
        const grid = document.getElementById('moviesGrid');
        const pagination = document.getElementById('libraryPagination');

        // Controlla se gli elementi DOM esistono
        if (!loading || !empty || !grid || !pagination) {
            console.warn('⚠️ Elementi DOM della libreria non trovati, DOM potrebbe non essere completamente caricato');
            return;
        }

        try {
            loading.style.display = 'block';
            empty.style.display = 'none';
            grid.style.display = 'none';
            pagination.style.display = 'none';

            const params = {
                page,
                limit: 20,
                ...this.libraryFilters
            };

            const response = await api.getMovies(params);
            const { movies, pagination: paginationData } = response.data;

            if (loading) {
                loading.style.display = 'none';
            }

            if (movies.length === 0) {
                empty.style.display = 'block';
                return;
            }

            this.renderMoviesGrid(movies);
            this.renderLibraryPagination(paginationData);

            grid.style.display = 'grid';
            if (paginationData.totalPages > 1) {
                pagination.style.display = 'flex';
            }

            // Aggiorna statistiche header
            await this.updateHeaderStats();

        } catch (error) {
            if (loading) {
                loading.style.display = 'none';
            }
            handleApiError(error, 'Errore nel caricamento della libreria');
        }
    }

    renderMoviesGrid(movies) {
        const grid = document.getElementById('moviesGrid');
        grid.innerHTML = movies.map(movie => this.createMovieCard(movie)).join('');
    }

    createMovieCard(movie) {
        const formats = [];
        if (movie.formats.dvd) formats.push('<span class="format-badge dvd">DVD</span>');
        if (movie.formats.bluray) formats.push('<span class="format-badge bluray">Blu-ray</span>');

        // Usa solo il poster URL originale, senza fallback
        const posterUrl = movie.posterUrl;

        return `
            <div class="movie-card" data-movie-id="${movie._id}" data-action="show-movie-modal">
                <img src="${posterUrl}" alt="${movie.title}" class="movie-poster" loading="lazy">
                <div class="movie-info">
                    <h3 class="movie-title" title="${movie.title}">${movie.title}</h3>
                    <div class="movie-year">${movie.year}</div>
                    <div class="movie-formats">
                        ${formats.join('')}
                    </div>
                </div>
            </div>
        `;
    }

    renderLibraryPagination(paginationData) {
        const container = document.getElementById('libraryPagination');
        const { currentPage, totalPages, hasPrev, hasNext } = paginationData;

        let html = '';

        // Bottone Previous
        html += `<button ${!hasPrev ? 'disabled' : ''} data-action="library-page" data-page="${currentPage - 1}">
            <i class="fas fa-chevron-left"></i>
        </button>`;

        // Numeri di pagina
        const startPage = Math.max(1, currentPage - 2);
        const endPage = Math.min(totalPages, currentPage + 2);

        if (startPage > 1) {
            html += `<button data-action="library-page" data-page="1">1</button>`;
            if (startPage > 2) {
                html += `<span>...</span>`;
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            html += `<button class="${i === currentPage ? 'active' : ''}" data-action="library-page" data-page="${i}">${i}</button>`;
        }

        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                html += `<span>...</span>`;
            }
            html += `<button data-action="library-page" data-page="${totalPages}">${totalPages}</button>`;
        }

        // Bottone Next
        html += `<button ${!hasNext ? 'disabled' : ''} data-action="library-page" data-page="${currentPage + 1}">
            <i class="fas fa-chevron-right"></i>
        </button>`;

        container.innerHTML = html;
    }

    async goToLibraryPage(page) {
        this.currentPage = page;
        await this.loadLibrary(page);
    }

    initLibraryFilters() {
        // Filtro formato
        const formatFilter = document.getElementById('formatFilter');
        formatFilter.addEventListener('change', (e) => {
            this.libraryFilters.format = e.target.value;
            this.currentPage = 1;
            this.loadLibrary();
        });

        // Ordinamento
        const sortBy = document.getElementById('sortBy');
        sortBy.addEventListener('change', (e) => {
            this.libraryFilters.sortBy = e.target.value;
            this.currentPage = 1;
            this.loadLibrary();
        });

        const sortOrder = document.getElementById('sortOrder');
        sortOrder.addEventListener('change', (e) => {
            this.libraryFilters.sortOrder = e.target.value;
            this.currentPage = 1;
            this.loadLibrary();
        });

        // Ricerca nella libreria
        const librarySearch = document.getElementById('librarySearch');
        const clearLibrarySearch = document.getElementById('clearLibrarySearch');
        const debouncedSearch = debounce((query) => {
            this.libraryFilters.search = query;
            this.currentPage = 1;
            this.loadLibrary();
        }, 300);

        librarySearch.addEventListener('input', (e) => {
            const value = e.target.value;
            debouncedSearch(value);
            this.toggleClearButton('librarySearch', value);
        });

        // Pulsante di pulizia per library search
        if (clearLibrarySearch) {
            clearLibrarySearch.addEventListener('click', () => {
                this.clearLibrarySearch();
            });
        }

        // Inizializza stato del pulsante di pulizia
        this.toggleClearButton('librarySearch', librarySearch.value);
    }

    // ============ SEARCH SECTION ============

    initSearch() {
        const searchInput = document.getElementById('searchInput');
        const searchBtn = document.getElementById('searchBtn');
        const clearSearchInput = document.getElementById('clearSearchInput');
        const suggestions = document.getElementById('searchSuggestions');

        // Debounced suggestions
        const debouncedSuggestions = debounce(async (query) => {
            if (query.length >= 2) {
                try {
                    const response = await api.getSearchSuggestions(query);
                    this.renderSearchSuggestions(response.data.suggestions);
                } catch (error) {
                    console.error('Errore suggerimenti:', error);
                    suggestions.style.display = 'none';
                }
            } else {
                suggestions.style.display = 'none';
            }
        }, 300);

        // Event listeners
        searchInput.addEventListener('input', (e) => {
            const value = e.target.value;
            debouncedSuggestions(value);
            this.toggleClearButton('searchInput', value);
        });

        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.performSearch();
            }
        });

        searchBtn.addEventListener('click', () => {
            this.performSearch();
        });

        // Pulsante di pulizia per search input
        if (clearSearchInput) {
            clearSearchInput.addEventListener('click', () => {
                this.clearSearchInput();
            });
        }

        // Nascondi suggerimenti quando si clicca fuori
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-input-container')) {
                suggestions.style.display = 'none';
            }
        });

        // Inizializza stato del pulsante di pulizia
        this.toggleClearButton('searchInput', searchInput.value);
    }

    renderSearchSuggestions(suggestions) {
        const container = document.getElementById('searchSuggestions');
        
        if (suggestions.length === 0) {
            container.style.display = 'none';
            return;
        }

        const html = suggestions.map(movie => `
            <div class="suggestion-item" data-action="select-suggestion" data-title="${movie.title.replace(/"/g, '&quot;')}">
                <img src="${movie.posterUrl}" alt="${movie.title}" class="suggestion-poster" loading="lazy">
                <div class="suggestion-info">
                    <h4>${movie.title}</h4>
                    <span>${movie.year || 'Anno sconosciuto'}</span>
                </div>
            </div>
        `).join('');

        container.innerHTML = html;
        container.style.display = 'block';
    }

    selectSuggestion(title) {
        const searchInput = document.getElementById('searchInput');
        searchInput.value = title;
        document.getElementById('searchSuggestions').style.display = 'none';
        
        // Mostra il pulsante di pulizia
        this.toggleClearButton('searchInput', title);
        
        this.performSearch();
    }

    async performSearch(page = 1) {
        const query = document.getElementById('searchInput').value.trim();
        if (query.length < 2) {
            showToast('Inserisci almeno 2 caratteri per la ricerca', 'warning');
            return;
        }

        const loading = document.getElementById('searchLoading');
        const results = document.getElementById('searchResults');
        const pagination = document.getElementById('searchPagination');

        try {
            loading.style.display = 'block';
            results.innerHTML = '';
            pagination.style.display = 'none';

            this.currentSearchQuery = query;
            this.currentSearchPage = page;

            const response = await api.searchMovies(query, page);
            const { results: movies, pagination: paginationData } = response.data;

            loading.style.display = 'none';

            if (movies.length === 0) {
                results.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-search"></i>
                        <h3>Nessun risultato trovato</h3>
                        <p>Prova con un altro termine di ricerca</p>
                    </div>
                `;
                return;
            }

            this.renderSearchResults(movies);
            this.renderSearchPagination(paginationData);

            if (paginationData.totalPages > 1) {
                pagination.style.display = 'flex';
            }

        } catch (error) {
            loading.style.display = 'none';
            handleApiError(error, 'Errore nella ricerca');
        }
    }

    renderSearchResults(movies) {
        const container = document.getElementById('searchResults');
        container.innerHTML = movies.map(movie => this.createSearchResultCard(movie)).join('');
    }

    createSearchResultCard(movie) {
        const posterUrl = movie.posterUrl;
        const inCollection = movie.inCollection;
        const ownedFormats = movie.ownedFormats || { dvd: false, bluray: false };

        let actionButton = '';
        if (inCollection) {
            const formats = [];
            if (ownedFormats.dvd) formats.push('DVD');
            if (ownedFormats.bluray) formats.push('Blu-ray');
            
            actionButton = `
                <div class="in-collection-badge">
                    Nella collezione (${formats.join(', ')})
                </div>
            `;
        } else {
            actionButton = `
                <div class="search-actions">
                    <div class="format-selector">
                        <label class="format-checkbox">
                            <input type="checkbox" name="format_${movie.tmdbId}" value="dvd"> DVD
                        </label>
                        <label class="format-checkbox">
                            <input type="checkbox" name="format_${movie.tmdbId}" value="bluray"> Blu-ray
                        </label>
                    </div>
                    <button class="btn btn-primary" data-action="add-movie" data-tmdb-id="${movie.tmdbId}">
                        <i class="fas fa-plus"></i>
                        Aggiungi
                    </button>
                </div>
            `;
        }

        return `
            <div class="search-result-card">
                <img src="${posterUrl}" alt="${movie.title}" class="search-poster" loading="lazy">
                <div class="search-content">
                    <h3 class="search-title">${movie.title}</h3>
                    <div class="search-meta">
                        <span><i class="fas fa-calendar"></i> ${movie.year || 'Anno sconosciuto'}</span>
                        ${movie.voteAverage ? `<span><i class="fas fa-star"></i> ${movie.voteAverage.toFixed(1)}/10</span>` : ''}
                    </div>
                    <p class="search-overview">${movie.overview || 'Descrizione non disponibile'}</p>
                    ${actionButton}
                </div>
            </div>
        `;
    }

    renderSearchPagination(paginationData) {
        const container = document.getElementById('searchPagination');
        const { currentPage, totalPages } = paginationData;

        let html = '';

        // Bottone Previous
        html += `<button ${currentPage <= 1 ? 'disabled' : ''} data-action="search-page" data-page="${currentPage - 1}">
            <i class="fas fa-chevron-left"></i>
        </button>`;

        // Numeri di pagina (limitati per spazio)
        const startPage = Math.max(1, currentPage - 2);
        const endPage = Math.min(totalPages, currentPage + 2);

        for (let i = startPage; i <= endPage; i++) {
            html += `<button class="${i === currentPage ? 'active' : ''}" data-action="search-page" data-page="${i}">${i}</button>`;
        }

        // Bottone Next
        html += `<button ${currentPage >= totalPages ? 'disabled' : ''} data-action="search-page" data-page="${currentPage + 1}">
            <i class="fas fa-chevron-right"></i>
        </button>`;

        container.innerHTML = html;
    }

    async goToSearchPage(page) {
        if (this.currentSearchQuery) {
            await this.performSearch(page);
        }
    }

    async addMovieToCollection(tmdbId) {
        const formatCheckboxes = document.querySelectorAll(`input[name="format_${tmdbId}"]:checked`);
        
        if (formatCheckboxes.length === 0) {
            showToast('Seleziona almeno un formato (DVD o Blu-ray)', 'warning');
            return;
        }

        const formats = {
            dvd: false,
            bluray: false
        };

        formatCheckboxes.forEach(checkbox => {
            formats[checkbox.value] = true;
        });

        try {
            const response = await api.addMovie({ tmdbId, formats });
            showToast(response.message || 'Film aggiunto alla collezione!', 'success');
            
            // Ricarica risultati di ricerca per aggiornare lo stato
            if (this.currentSearchQuery) {
                await this.performSearch(this.currentSearchPage);
            }
            
            // Aggiorna statistiche
            await this.updateHeaderStats();
            
        } catch (error) {
            handleApiError(error, 'Errore nell\'aggiungere il film');
        }
    }

    // ============ CLEAR SEARCH FUNCTIONALITY ============

    toggleClearButton(inputId, value) {
        const clearBtn = inputId === 'librarySearch' ? 
            document.getElementById('clearLibrarySearch') : 
            document.getElementById('clearSearchInput');
        
        const container = inputId === 'librarySearch' ? 
            document.querySelector('.library-search') : 
            document.querySelector('.search-input-container');
        
        if (clearBtn && container) {
            if (value.trim().length > 0) {
                clearBtn.classList.add('visible');
                if (inputId === 'librarySearch') {
                    container.classList.add('has-content');
                }
            } else {
                clearBtn.classList.remove('visible');
                if (inputId === 'librarySearch') {
                    container.classList.remove('has-content');
                }
            }
        }
    }

    clearLibrarySearch() {
        const librarySearch = document.getElementById('librarySearch');
        const clearBtn = document.getElementById('clearLibrarySearch');
        const container = document.querySelector('.library-search');
        
        if (librarySearch) {
            librarySearch.value = '';
            librarySearch.focus();
            
            // Aggiorna filtri e ricarica
            this.libraryFilters.search = '';
            this.currentPage = 1;
            this.loadLibrary();
            
            // Nascondi pulsante clear
            if (clearBtn) {
                clearBtn.classList.remove('visible');
            }
            if (container) {
                container.classList.remove('has-content');
            }
        }
    }

    clearSearchInput() {
        const searchInput = document.getElementById('searchInput');
        const clearBtn = document.getElementById('clearSearchInput');
        const suggestions = document.getElementById('searchSuggestions');
        const searchResults = document.getElementById('searchResults');
        const searchPagination = document.getElementById('searchPagination');
        
        if (searchInput) {
            searchInput.value = '';
            searchInput.focus();
            
            // Reset ricerca
            this.currentSearchQuery = '';
            this.currentSearchPage = 1;
            
            // Nascondi elementi di ricerca
            if (suggestions) {
                suggestions.style.display = 'none';
            }
            if (searchResults) {
                searchResults.innerHTML = '';
            }
            if (searchPagination) {
                searchPagination.style.display = 'none';
            }
            
            // Nascondi pulsante clear
            if (clearBtn) {
                clearBtn.classList.remove('visible');
            }
        }
    }

    // ============ MODAL ============

    async showMovieModal(movieId) {
        const modal = document.getElementById('movieModal');
        const modalTitle = document.getElementById('modalTitle');
        const modalBody = document.getElementById('modalBody');

        try {
            modalTitle.textContent = 'Caricamento...';
            modalBody.innerHTML = '<div class="loading"><div class="spinner"></div><p>Caricamento dettagli...</p></div>';
            modal.classList.add('active');

            const response = await api.getMovie(movieId);
            const movie = response.data;

            modalTitle.textContent = movie.title;
            modalBody.innerHTML = this.createMovieDetailContent(movie);

        } catch (error) {
            modalBody.innerHTML = `<div class="empty-state"><i class="fas fa-exclamation-triangle"></i><h3>Errore</h3><p>Impossibile caricare i dettagli del film</p></div>`;
            handleApiError(error, 'Errore nel caricamento dei dettagli');
        }
    }

    createMovieDetailContent(movie) {
        const posterUrl = movie.posterUrl;
        
        const formats = [];
        if (movie.formats.dvd) formats.push('DVD');
        if (movie.formats.bluray) formats.push('Blu-ray');

        return `
            <div class="movie-detail">
                <img src="${posterUrl}" alt="${movie.title}" class="movie-detail-poster" loading="lazy">
                <div class="movie-detail-info">
                    <h2 class="movie-detail-title">${movie.title}</h2>
                    ${movie.originalTitle !== movie.title ? `<p><strong>Titolo originale:</strong> ${movie.originalTitle}</p>` : ''}
                    <div class="movie-detail-meta">
                        <span><i class="fas fa-calendar"></i> ${movie.year}</span>
                        ${movie.runtime ? `<span><i class="fas fa-clock"></i> ${movie.runtime} min</span>` : ''}
                        ${movie.voteAverage ? `<span><i class="fas fa-star"></i> ${movie.voteAverage.toFixed(1)}/10</span>` : ''}
                        <span><i class="fas fa-plus-circle"></i> ${new Date(movie.dateAdded).toLocaleDateString('it-IT')}</span>
                    </div>
                    ${movie.genres && movie.genres.length > 0 ? `<p><strong>Generi:</strong> ${movie.genres.join(', ')}</p>` : ''}
                    ${movie.overview ? `<div class="movie-detail-overview"><strong>Descrizione:</strong><br>${movie.overview}</div>` : ''}
                    <p><strong>Formati posseduti:</strong> ${formats.join(', ')}</p>
                    <div class="movie-detail-actions">
                        <button class="btn btn-outline" data-action="edit-formats" data-movie-id="${movie._id}" data-formats="${JSON.stringify(movie.formats).replace(/"/g, '&quot;')}">
                            <i class="fas fa-edit"></i>
                            Modifica formati
                        </button>
                        <button class="btn btn-outline" style="color: var(--error-color); border-color: var(--error-color);" data-action="delete-movie" data-movie-id="${movie._id}" data-title="${movie.title.replace(/"/g, '&quot;')}">
                            <i class="fas fa-trash"></i>
                            Rimuovi
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    closeModal() {
        document.getElementById('movieModal').classList.remove('active');
    }

    async editMovieFormats(movieId, currentFormats) {
        const dvdChecked = currentFormats.dvd ? 'checked' : '';
        const blurayChecked = currentFormats.bluray ? 'checked' : '';

        const modalBody = document.getElementById('modalBody');
        modalBody.innerHTML = `
            <div style="text-align: center;">
                <h3>Modifica Formati</h3>
                <p>Seleziona i formati che possiedi:</p>
                <div style="margin: 2rem 0; display: flex; justify-content: center; gap: 2rem;">
                    <label style="display: flex; align-items: center; gap: 0.5rem;">
                        <input type="checkbox" id="editDvd" ${dvdChecked}> DVD
                    </label>
                    <label style="display: flex; align-items: center; gap: 0.5rem;">
                        <input type="checkbox" id="editBluray" ${blurayChecked}> Blu-ray
                    </label>
                </div>
                <div style="display: flex; justify-content: center; gap: 1rem;">
                    <button class="btn btn-primary" data-action="save-formats" data-movie-id="${movieId}">
                        <i class="fas fa-save"></i>
                        Salva
                    </button>
                    <button class="btn btn-secondary" data-action="show-movie-modal" data-movie-id="${movieId}">
                        Annulla
                    </button>
                </div>
            </div>
        `;
    }

    async saveMovieFormats(movieId) {
        const dvdChecked = document.getElementById('editDvd').checked;
        const blurayChecked = document.getElementById('editBluray').checked;

        if (!dvdChecked && !blurayChecked) {
            showToast('Seleziona almeno un formato', 'warning');
            return;
        }

        try {
            const formats = {
                dvd: dvdChecked,
                bluray: blurayChecked
            };

            await api.updateMovie(movieId, formats);
            showToast('Formati aggiornati con successo!', 'success');
            
            // Ricarica il modal con i nuovi dati
            await this.showMovieModal(movieId);
            
            // Ricarica la libreria se siamo nella sezione libreria
            if (this.currentSection === 'library') {
                await this.loadLibrary(this.currentPage);
            }

        } catch (error) {
            handleApiError(error, 'Errore nell\'aggiornare i formati');
        }
    }

    async deleteMovie(movieId, movieTitle) {
        if (!confirm(`Sei sicuro di voler rimuovere "${movieTitle}" dalla collezione?`)) {
            return;
        }

        try {
            await api.deleteMovie(movieId);
            showToast('Film rimosso dalla collezione', 'success');
            
            this.closeModal();
            
            // Ricarica la libreria se siamo nella sezione libreria
            if (this.currentSection === 'library') {
                await this.loadLibrary(this.currentPage);
            }
            
            // Aggiorna statistiche
            await this.updateHeaderStats();

        } catch (error) {
            handleApiError(error, 'Errore nella rimozione del film');
        }
    }

    // ============ BACKUP SECTION ============

    async loadBackupStats() {
        try {
            const [movieStats, backupStats] = await Promise.all([
                api.getMovieStats(),
                api.getBackupStats()
            ]);

            // Aggiorna statistiche collezione
            const stats = movieStats.data;
            document.getElementById('statTotalMovies').textContent = stats.totalMovies;
            document.getElementById('statDvdCount').textContent = stats.formats.dvd;
            document.getElementById('statBlurayCount').textContent = stats.formats.bluray;
            document.getElementById('statBothCount').textContent = stats.formats.both;

        } catch (error) {
            handleApiError(error, 'Errore nel caricamento delle statistiche');
        }
    }

    initBackup() {
        const backupFile = document.getElementById('backupFile');
        const importBtn = document.getElementById('importBtn');

        backupFile.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                if (file.type === 'application/json') {
                    importBtn.disabled = false;
                    importBtn.textContent = `Importa ${file.name}`;
                } else {
                    showToast('Seleziona un file JSON valido', 'warning');
                    importBtn.disabled = true;
                    e.target.value = '';
                }
            } else {
                importBtn.disabled = true;
                importBtn.innerHTML = '<i class="fas fa-upload"></i> Importa';
            }
        });
    }

    // ============ STATISTICS ============

    async updateHeaderStats() {
        try {
            const response = await api.getMovieStats();
            document.getElementById('totalMovies').textContent = response.data.totalMovies;
        } catch (error) {
            console.error('Errore aggiornamento statistiche header:', error);
        }
    }
}

// ============ TOAST NOTIFICATIONS ============

function showToast(message, type = 'info', duration = 4000) {
    const container = document.getElementById('toastContainer');
    
    // Controlla se il container esiste
    if (!container) {
        console.warn('⚠️ Toast container non trovato, DOM potrebbe non essere completamente caricato');
        console.log(`Toast message: ${message}`);
        return;
    }
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const icons = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-circle',
        warning: 'fas fa-exclamation-triangle',
        info: 'fas fa-info-circle'
    };

    toast.innerHTML = `
        <i class="toast-icon ${icons[type] || icons.info}"></i>
        <div class="toast-content">${message}</div>
        <button class="toast-close" data-action="close-toast">
            <i class="fas fa-times"></i>
        </button>
    `;

    container.appendChild(toast);

    // Rimuovi automaticamente dopo la durata specificata
    setTimeout(() => {
        if (toast.parentElement) {
            toast.remove();
        }
    }, duration);
}

// ============ EXPORT/IMPORT FUNCTIONS ============

async function exportData(format) {
    try {
        showToast('Preparazione export in corso...', 'info');
        
        let blob, filename;
        const date = new Date().toISOString().split('T')[0];

        switch (format) {
            case 'json':
                blob = await api.exportJSON();
                filename = `movie-collection-${date}.json`;
                break;
            case 'mongodb':
                blob = await api.exportMongoDB();
                filename = `movie-collection-mongodb-${date}.json`;
                break;
            case 'csv':
                blob = await api.exportCSV();
                filename = `movie-collection-${date}.csv`;
                break;
            default:
                throw new Error('Formato non supportato');
        }

        downloadBlob(blob, filename);
        showToast(`Export ${format.toUpperCase()} completato!`, 'success');

    } catch (error) {
        handleApiError(error, `Errore nell'export ${format.toUpperCase()}`);
    }
}

async function importData() {
    const fileInput = document.getElementById('backupFile');
    const file = fileInput.files[0];
    
    if (!file) {
        showToast('Seleziona un file da importare', 'warning');
        return;
    }

    const mode = document.querySelector('input[name="importMode"]:checked').value;
    
    if (mode === 'replace' && !confirm('ATTENZIONE: Questa operazione sostituirà completamente la tua collezione attuale. Sei sicuro di voler continuare?')) {
        return;
    }

    try {
        showToast('Import in corso...', 'info');
        
        const response = await api.importBackup(file, mode);
        const { imported, updated, skipped, errors } = response.data;
        
        let message = `Import completato! ${imported} importati, ${updated} aggiornati`;
        if (skipped > 0) message += `, ${skipped} saltati`;
        if (errors > 0) message += `, ${errors} errori`;
        
        showToast(message, 'success', 6000);
        
        // Reset form
        fileInput.value = '';
        document.getElementById('importBtn').disabled = true;
        document.getElementById('importBtn').innerHTML = '<i class="fas fa-upload"></i> Importa';
        
        // Ricarica dati se siamo nella sezione libreria
        if (ui.currentSection === 'library') {
            await ui.loadLibrary();
        }
        
        // Aggiorna statistiche
        await ui.updateHeaderStats();
        if (ui.currentSection === 'backup') {
            await ui.loadBackupStats();
        }

    } catch (error) {
        handleApiError(error, 'Errore durante l\'import');
    }
}

// Funzioni globali per compatibilità con onclick HTML (mantenute per eventuali chiamate esterne)
function switchSection(section) {
    ui.switchSection(section);
}

function closeModal() {
    ui.closeModal();
}

// Istanza globale UI Manager
const ui = new UIManager();
