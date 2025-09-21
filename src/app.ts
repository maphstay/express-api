import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import topicRoutes from '@routes/topic.route';
import { LoggerService } from '@logging/logger.service';
import { ErrorMiddleware } from '@middlewares/error.middleware';
// import resourceRoutes from './routes/resource.routes';
// import userRoutes from './routes/user.routes';
const logger = new LoggerService();
const errorMiddleware = new ErrorMiddleware(logger);

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use('/api/topics', topicRoutes);
// app.use('/api/resources', resourceRoutes);
// app.use('/api/users', userRoutes);

app.use(errorMiddleware.handle);

export default app;
