// logger.js
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info', // Nivel de logging
  format: winston.format.combine(
    winston.format.timestamp(), // Agregar timestamp
    winston.format.json() // Formato JSON
  ),
  transports: [
    new winston.transports.Console(), // Log a la consola
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }), // Log de errores a un archivo
    new winston.transports.File({ filename: 'logs/combined.log' }) // Log combinado a un archivo
  ],
});

// Crear el directorio de logs si no existe
import fs from 'fs';
const dir = './logs';
if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
}

export default logger;