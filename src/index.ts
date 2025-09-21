import 'module-alias/register';
import app from './app';
import { LoggerService } from '@logging/logger.service';

const PORT = process.env.PORT || 3000;
const logger = new LoggerService();

app.listen(PORT, () => {
  logger.info(`🚀 Server running on http://localhost:${PORT}`);
});
