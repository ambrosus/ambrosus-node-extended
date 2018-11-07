import 'reflect-metadata';

import * as bodyParser from 'body-parser';
import * as cors from 'cors';
import { InversifyExpressServer } from 'inversify-express-utils';
import * as morgan from 'morgan';

import { config } from './config';
import { TYPE } from './constant/types';
import { iocContainer } from './inversify.config';
import { LoggerService } from './service/logger.service';
import { AMBAccountProvider } from './middleware/amb-account.provider';

const server = new InversifyExpressServer(
  iocContainer,
  undefined,
  undefined,
  undefined,
  AMBAccountProvider
);

const logger = iocContainer.get<LoggerService>(TYPE.LoggerService);

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
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT ');
    next();
  });
});

server.setErrorConfig(app => {
  app.use((err, req, res, next) => {
    // Unhandled exceptions only
    res.status(500).send({ reason: err.message });
  });
});

const app_server = server.build();
app_server.listen(config.port);

logger.info(`${process.env.NODE_ENV} Hermes++ is running on ${config.port} :)`);

exports = module.exports = app_server;
