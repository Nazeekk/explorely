import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import yaml from 'yaml';
import fs from 'fs';
import path from 'path';
import swaggerUi from 'swagger-ui-express';

import exampleRoutes from './routes/example';
import { errorHandler } from './middlewares/errorHandler';

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

const swaggerDocument = yaml.parse(
  fs.readFileSync(path.join(__dirname, './docs/swagger.yaml'), 'utf8'),
);

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use('/example', exampleRoutes);

app.get('/health', (req, res) => {
  res.send({ status: 'OK', service: 'example-service' });
});

app.use(errorHandler);

export default app;
