// Test utility per la configurazione backend
// ==========================================

import { 
  getApiConfig, 
  getBackendConfig, 
  getEndpointUrl, 
  validateBackendConfig,
  debugBackendConfig,
  testBackendConnection,
  getConfigInfo
} from '../config/backend.js'

/**
 * Test completo della configurazione backend
 */
export async function testBackendConfiguration() {
  console.group('🧪 Test Configurazione Backend')
  
  const results = {
    validation: null,
    apiConfig: null,
    endpoints: {},
    connectivity: null,
    configInfo: null,
    errors: []
  }
  
  try {
    // 1. Validazione configurazione
    console.log('1️⃣ Validazione configurazione...')
    results.validation = validateBackendConfig()
    
    if (results.validation.valid) {
      console.log('✅ Configurazione valida')
    } else {
      console.error('❌ Configurazione non valida:', results.validation.errors)
      results.errors.push(...results.validation.errors)
    }
    
    // 2. Test configurazione API
    console.log('2️⃣ Test configurazione API...')
    results.apiConfig = getApiConfig()
    console.log('📡 API Config:', {
      baseUrl: results.apiConfig.baseUrl,
      mode: results.apiConfig.mode,
      timeout: results.apiConfig.timeout,
      retryAttempts: results.apiConfig.retryAttempts
    })
    
    // 3. Test endpoint URLs
    console.log('3️⃣ Test endpoint URLs...')
    const endpointKeys = ['movies', 'search', 'health', 'stats']
    
    for (const key of endpointKeys) {
      try {
        results.endpoints[key] = getEndpointUrl(key)
        console.log(`📍 ${key}: ${results.endpoints[key]}`)
      } catch (error) {
        console.error(`❌ Errore endpoint ${key}:`, error.message)
        results.errors.push(`Endpoint ${key}: ${error.message}`)
      }
    }
    
    // 4. Test connettività
    console.log('4️⃣ Test connettività...')
    try {
      results.connectivity = await testBackendConnection()
      
      if (results.connectivity.connected) {
        console.log('✅ Backend raggiungibile')
      } else {
        console.warn('⚠️ Backend non raggiungibile:', results.connectivity.error)
      }
    } catch (error) {
      console.error('❌ Errore test connettività:', error.message)
      results.errors.push(`Connettività: ${error.message}`)
    }
    
    // 5. Informazioni configurazione
    console.log('5️⃣ Informazioni configurazione...')
    results.configInfo = getConfigInfo()
    console.log('ℹ️ Config Info:', results.configInfo)
    
    // 6. Debug configurazione se in modalità debug
    if (results.apiConfig.debug) {
      console.log('6️⃣ Debug configurazione...')
      debugBackendConfig()
    }
    
  } catch (error) {
    console.error('💥 Errore generale nel test:', error.message)
    results.errors.push(`Errore generale: ${error.message}`)
  }
  
  // Riepilogo finale
  console.log('\n📊 Riepilogo Test:')
  console.log(`✅ Configurazione valida: ${results.validation?.valid ? 'Sì' : 'No'}`)
  console.log(`🔗 Backend raggiungibile: ${results.connectivity?.connected ? 'Sì' : 'No'}`)
  console.log(`📍 Endpoint testati: ${Object.keys(results.endpoints).length}`)
  console.log(`❌ Errori totali: ${results.errors.length}`)
  
  if (results.errors.length > 0) {
    console.error('\n🚨 Errori riscontrati:')
    results.errors.forEach((error, index) => {
      console.error(`${index + 1}. ${error}`)
    })
  } else {
    console.log('\n🎉 Tutti i test sono passati con successo!')
  }
  
  console.groupEnd()
  
  return {
    success: results.errors.length === 0,
    results,
    summary: {
      valid: results.validation?.valid || false,
      connected: results.connectivity?.connected || false,
      endpointsCount: Object.keys(results.endpoints).length,
      errorsCount: results.errors.length
    }
  }
}

/**
 * Test rapido della configurazione (solo validazione)
 */
export function quickConfigTest() {
  console.log('⚡ Test rapido configurazione...')
  
  const validation = validateBackendConfig()
  const apiConfig = getApiConfig()
  
  console.log(`Configurazione valida: ${validation.valid ? '✅' : '❌'}`)
  console.log(`URL Backend: ${apiConfig.baseUrl}`)
  console.log(`Modalità: ${apiConfig.mode}`)
  
  if (!validation.valid) {
    console.error('Errori:', validation.errors)
  }
  
  return validation.valid
}

/**
 * Test di connettività semplice
 */
export async function quickConnectivityTest() {
  console.log('🔗 Test rapido connettività...')
  
  try {
    const result = await testBackendConnection()
    console.log(`Backend raggiungibile: ${result.connected ? '✅' : '❌'}`)
    
    if (!result.connected) {
      console.warn('Errore:', result.error)
    }
    
    return result.connected
  } catch (error) {
    console.error('Errore test connettività:', error.message)
    return false
  }
}

/**
 * Utility per debug configurazione in console
 */
export function debugConfiguration() {
  console.group('🔧 Debug Configurazione')
  
  const backendConfig = getBackendConfig()
  const configInfo = getConfigInfo()
  
  console.log('Backend Config:', backendConfig)
  console.log('Config Info:', configInfo)
  
  if (typeof window !== 'undefined') {
    console.log('Window Location:', {
      href: window.location.href,
      hostname: window.location.hostname,
      protocol: window.location.protocol,
      port: window.location.port
    })
  }
  
  console.groupEnd()
}

// Esporta funzioni per uso in console del browser
if (typeof window !== 'undefined') {
  window.testBackendConfig = testBackendConfiguration
  window.quickConfigTest = quickConfigTest
  window.quickConnectivityTest = quickConnectivityTest
  window.debugConfig = debugConfiguration
}
