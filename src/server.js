import app from './app.js';
import logger from '../infrastructure/logger.js';
import './domains/notifications/workers/email.worker.js';

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => logger.info(`Servidor corriendo en el puerto ${PORT}`));
