#!/usr/bin/env node

/**
 * Script di Setup per Movie Collection WebApp
 * 
 * Questo script:
 * - Inizializza la connessione MongoDB
 * - Crea gli indici necessari
 * - Testa la connessione TMDB API
 * - Fornisce esempi di uso
 */

require('dotenv').config();
const mongoose = require('mongoose');
const axios = require('axios');
const Movie = require('./models/Movie');
const tmdbService = require('./config/tmdb');

// Colori per output console
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step, message) {
    log(`[${step}] ${message}`, 'cyan');
}

function logSuccess(message) {
    log(`✅ ${message}`, 'green');
}

function logError(message) {
    log(`❌ ${message}`, 'red');
}

function logWarning(message) {
    log(`⚠️ ${message}`, 'yellow');
}

async function checkEnvironmentVariables() {
    logStep('1', 'Controllo variabili di ambiente...');
    
    const requiredVars = [
        'MONGODB_URI',
        'TMDB_API_KEY'
    ];
    
    const missingVars = [];
    
    for (const varName of requiredVars) {
        if (!process.env[varName]) {
            missingVars.push(varName);
        }
    }
    
    if (missingVars.length > 0) {
        logError('Variabili di ambiente mancanti:');
        missingVars.forEach(varName => {
            log(`  - ${varName}`, 'red');
        });
        log('\nCrea un file .env basato su env.template e inserisci i valori corretti.', 'yellow');
        process.exit(1);
    }
    
    logSuccess('Tutte le variabili di ambiente sono presenti');
}

async function connectToMongoDB() {
    logStep('2', 'Connessione a MongoDB...');
    
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        
        logSuccess(`Connesso a MongoDB: ${mongoose.connection.host}`);
        
        // Test connessione
        const adminDb = mongoose.connection.db.admin();
        const result = await adminDb.ping();
        
        if (result.ok === 1) {
            logSuccess('Ping MongoDB riuscito');
        }
        
    } catch (error) {
        logError(`Errore connessione MongoDB: ${error.message}`);
        log('\nVerifica che MongoDB sia in esecuzione e che MONGODB_URI sia corretto.', 'yellow');
        process.exit(1);
    }
}

async function createDatabaseIndexes() {
    logStep('3', 'Creazione indici database...');
    
    try {
        // Gli indici sono già definiti nel schema Mongoose
        // Qui forziamo la loro creazione
        await Movie.createIndexes();
        
        logSuccess('Indici database creati con successo');
        
        // Mostra indici creati
        const indexes = await Movie.collection.getIndexes();
        log('Indici disponibili:', 'blue');
        Object.keys(indexes).forEach(indexName => {
            log(`  - ${indexName}`, 'blue');
        });
        
    } catch (error) {
        logError(`Errore creazione indici: ${error.message}`);
        throw error;
    }
}

async function testTMDBConnection() {
    logStep('4', 'Test connessione TMDB API...');
    
    try {
        const isConnected = await tmdbService.testConnection();
        
        if (isConnected) {
            logSuccess('Connessione TMDB API funzionante');
            
            // Test ricerca
            log('Test ricerca film...', 'blue');
            const searchResults = await tmdbService.searchMovies('Matrix', 1);
            
            if (searchResults.results && searchResults.results.length > 0) {
                logSuccess(`Trovati ${searchResults.results.length} risultati per "Matrix"`);
                const firstResult = searchResults.results[0];
                log(`Primo risultato: ${firstResult.title} (${firstResult.year})`, 'blue');
            }
            
        } else {
            throw new Error('Test connessione TMDB fallito');
        }
        
    } catch (error) {
        logError(`Errore TMDB API: ${error.message}`);
        log('\nVerifica che TMDB_API_KEY sia valido e che tu abbia accesso a internet.', 'yellow');
        log('Puoi ottenere una API key gratuita su: https://www.themoviedb.org/settings/api', 'yellow');
        throw error;
    }
}

async function createSampleData() {
    logStep('5', 'Controllo dati di esempio...');
    
    try {
        const movieCount = await Movie.countDocuments();
        
        if (movieCount === 0) {
            log('Nessun film trovato, vuoi aggiungere dei dati di esempio? (y/n)', 'yellow');
            
            // In un ambiente automatico, salta i dati di esempio
            if (process.argv.includes('--no-samples')) {
                log('Saltando creazione dati di esempio (--no-samples)', 'blue');
                return;
            }
            
            // Aggiungi alcuni film di esempio
            const sampleMovies = [
                { tmdbId: 603, title: 'The Matrix', formats: { dvd: true, bluray: false } },
                { tmdbId: 550, title: 'Fight Club', formats: { dvd: false, bluray: true } },
                { tmdbId: 157336, title: 'Interstellar', formats: { dvd: true, bluray: true } }
            ];
            
            for (const movieData of sampleMovies) {
                try {
                    const movieDetails = await tmdbService.getMovieDetails(movieData.tmdbId);
                    const newMovie = new Movie({
                        ...movieDetails,
                        formats: movieData.formats
                    });
                    await newMovie.save();
                    log(`Aggiunto: ${movieDetails.title}`, 'green');
                } catch (error) {
                    logWarning(`Errore aggiunta ${movieData.title}: ${error.message}`);
                }
            }
            
            logSuccess('Dati di esempio creati');
        } else {
            logSuccess(`Database già popolato con ${movieCount} film`);
        }
        
    } catch (error) {
        logWarning(`Errore creazione dati di esempio: ${error.message}`);
        // Non bloccare il setup per questo errore
    }
}

async function showSystemInfo() {
    logStep('6', 'Informazioni sistema...');
    
    try {
        const dbStats = await mongoose.connection.db.stats();
        const movieCount = await Movie.countDocuments();
        
        log('\n📊 STATISTICHE SISTEMA:', 'magenta');
        log(`Database: ${mongoose.connection.name}`, 'blue');
        log(`Collezioni: ${dbStats.collections}`, 'blue');
        log(`Dimensione DB: ${(dbStats.dataSize / 1024 / 1024).toFixed(2)} MB`, 'blue');
        log(`Film nella collezione: ${movieCount}`, 'blue');
        log(`Node.js: ${process.version}`, 'blue');
        log(`MongoDB: ${mongoose.version}`, 'blue');
        
        // Informazioni TMDB
        if (process.env.TMDB_API_KEY) {
            log(`TMDB API: Configurato`, 'blue');
        }
        
        log(`Porta server: ${process.env.PORT || 3000}`, 'blue');
        log(`Ambiente: ${process.env.NODE_ENV || 'development'}`, 'blue');
        
    } catch (error) {
        logWarning(`Errore recupero info sistema: ${error.message}`);
    }
}

function showUsageExamples() {
    log('\n🚀 ESEMPI DI USO:', 'magenta');
    log('', 'reset');
    
    log('Avvia il server:', 'cyan');
    log('  npm start', 'blue');
    log('', 'reset');
    
    log('Avvia in modalità sviluppo:', 'cyan');
    log('  npm run dev', 'blue');
    log('', 'reset');
    
    log('Accedi all\'applicazione:', 'cyan');
    log(`  http://localhost:${process.env.PORT || 3000}`, 'blue');
    log('', 'reset');
    
    log('MongoDB Compass:', 'cyan');
    log(`  URI: ${process.env.MONGODB_URI}`, 'blue');
    log('', 'reset');
    
    log('Test API:', 'cyan');
    log(`  curl http://localhost:${process.env.PORT || 3000}/api/health`, 'blue');
    log(`  curl http://localhost:${process.env.PORT || 3000}/api/movies`, 'blue');
    log('', 'reset');
}

function showMongoDBGuide() {
    log('\n💾 GUIDA MONGODB COMPASS:', 'magenta');
    log('', 'reset');
    
    log('1. Installa MongoDB Compass:', 'cyan');
    log('   https://www.mongodb.com/products/compass', 'blue');
    log('', 'reset');
    
    log('2. Connetti al database:', 'cyan');
    log(`   URI: ${process.env.MONGODB_URI}`, 'blue');
    log('', 'reset');
    
    log('3. Naviga alla collezione "movies"', 'cyan');
    log('', 'reset');
    
    log('4. Query utili:', 'cyan');
    log('   Tutti i film: {}', 'blue');
    log('   Solo DVD: {"formats.dvd": true}', 'blue');
    log('   Solo Blu-ray: {"formats.bluray": true}', 'blue');
    log('   Per anno: {"year": 2023}', 'blue');
    log('   Per genere: {"genres": "Action"}', 'blue');
    log('', 'reset');
}

async function main() {
    log('\n🎬 MOVIE COLLECTION WEBAPP - SETUP', 'magenta');
    log('=====================================', 'magenta');
    log('', 'reset');
    
    try {
        await checkEnvironmentVariables();
        await connectToMongoDB();
        await createDatabaseIndexes();
        await testTMDBConnection();
        await createSampleData();
        await showSystemInfo();
        
        log('\n🎉 SETUP COMPLETATO CON SUCCESSO!', 'green');
        log('', 'reset');
        
        showUsageExamples();
        showMongoDBGuide();
        
    } catch (error) {
        log('\n💥 SETUP FALLITO!', 'red');
        logError(`Errore: ${error.message}`);
        log('', 'reset');
        
        if (error.stack) {
            log('Stack trace:', 'red');
            log(error.stack, 'red');
        }
        
        process.exit(1);
    } finally {
        // Chiudi connessione MongoDB
        if (mongoose.connection.readyState === 1) {
            await mongoose.connection.close();
            log('Connessione MongoDB chiusa', 'blue');
        }
    }
}

// Gestione segnali di interruzione
process.on('SIGINT', async () => {
    log('\nInterruzione ricevuta, chiusura...', 'yellow');
    if (mongoose.connection.readyState === 1) {
        await mongoose.connection.close();
    }
    process.exit(0);
});

process.on('SIGTERM', async () => {
    log('\nTerminazione ricevuta, chiusura...', 'yellow');
    if (mongoose.connection.readyState === 1) {
        await mongoose.connection.close();
    }
    process.exit(0);
});

// Avvia setup
main().catch(console.error);
