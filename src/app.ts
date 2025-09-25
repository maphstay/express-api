import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import authRoutes from '@routes/auth.route';
import topicRoutes from '@routes/topic.route';
import resourceRoutes from '@routes/resource.route';
import userRoutes from './routes/user.route';
import { LoggerService } from '@logging/logger.service';
import { ErrorMiddleware } from '@middlewares/error.middleware';
import { setupSwagger } from './swagger.config';
const logger = new LoggerService();
const errorMiddleware = new ErrorMiddleware(logger);

const app = express();
app.use(cors());
app.use(bodyParser.json());

setupSwagger(app);

app.use('/api/auth', authRoutes);
app.use('/api/topics', topicRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/users', userRoutes);

app.use(errorMiddleware.handle);

export default app;
