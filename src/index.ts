import 'reflect-metadata';

import * as bodyParser from 'body-parser';
import * as cors from 'cors';
import { InversifyExpressServer } from 'inversify-express-utils';
import * as morgan from 'morgan';

import { config } from './config';
import { TYPES } from './constant/types';
import { AuthenticationError, NotFoundError, PermissionError, ValidationError } from './error';
import { iocContainer } from './inversify.config';
import { LoggerService } from './service/logger.service';
import { AMBAuthProvider } from './util/auth/auth.provider';

const server = new InversifyExpressServer(
  iocContainer,
  undefined,
  undefined,
  undefined,
  AMBAuthProvider
);

const logger = iocContainer.get<LoggerService>(TYPES.LoggerService);

server.setConfig(app => {
  app.set('json spaces', 2);
  app.use(
    bodyParser.urlencoded({
      extended: true,
    })
  );
  app.use(bodyParser.json());
  // app.use(helmet());
  app.use(morgan('combined'));
  app.use(cors());
  app.use((req, res, next) => {
    res.set('cache-control', 'no-store');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS ');
    next();
  });
});

server.setErrorConfig(app => {
  app.use((err, req, res, next) => {
    let status;
    if (err instanceof ValidationError || err.type === 'entity.parse.failed') {
      status = 400;
    } else if (err instanceof AuthenticationError) {
      status = 401;
    } else if (err instanceof PermissionError) {
      status = 403;
    } else if (err instanceof NotFoundError) {
      status = 404;
    } else if (err.type === 'entity.too.large') {
      status = 413;
    } else {
      logger.error(err);
      status = 500;
    }

    res.status(status).send({ reason: err.message });
  });
});

const app_server = server.build();
app_server.listen(config.port);

logger.info(`${process.env.NODE_ENV} Hermes++ is running on ${config.port} :)`);

exports = module.exports = app_server;
