import winston from 'winston';

const { combine, json, colorize, printf, errors } = winston.format;
const winstonTimestamp = winston.format.timestamp;

// Formato personalizado para consola en desarrollo
const consoleFormat = combine(
  colorize(),
  winstonTimestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  errors({ stack: true }),
  printf(({ level, message, timestamp, stack }) => {
    return `${timestamp} [${level}]: ${stack || message}`;
  }),
);

// Formato para archivos y producción (JSON estructurado)
const fileFormat = combine(winstonTimestamp(), errors({ stack: true }), json());

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: fileFormat,
  transports: [
    // Escribir todos los errores en error.log
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // Escribir todos los logs en combined.log
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
  // Manejar excepciones y promesas no capturadas
  exceptionHandlers: [
    new winston.transports.File({ filename: 'logs/exceptions.log' }),
  ],
  rejectionHandlers: [
    new winston.transports.File({ filename: 'logs/rejections.log' }),
  ],
});

// Si no estamos en producción, loguear a la consola con formato legible
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: consoleFormat,
    }),
  );
}

export default logger;
