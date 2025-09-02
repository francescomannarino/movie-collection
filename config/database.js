const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`✅ MongoDB connesso: ${conn.connection.host}`);
    
    // Event listeners per gestire la connessione
    mongoose.connection.on('error', (err) => {
      console.error('❌ Errore MongoDB:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB disconnesso');
    });

    // Gestione chiusura graceful
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('🔌 Connessione MongoDB chiusa');
      process.exit(0);
    });

    return conn;
  } catch (error) {
    console.error('❌ Errore connessione MongoDB:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
