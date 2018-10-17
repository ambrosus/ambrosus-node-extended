import 'reflect-metadata';

import * as bodyParser from 'body-parser';
import * as cors from 'cors';
import { InversifyExpressServer } from 'inversify-express-utils';
import * as morgan from 'morgan';

import { config } from './config';
import { TYPES } from './constant/types';
import { GraphQLController } from './controller/graphql.controller';
import { container } from './inversify.config';
import { LoggerService } from './service/logger.service';

const server = new InversifyExpressServer(container);

server.setConfig(app => {
  container.get<GraphQLController>(TYPES.GraphQLController).setup(app);
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
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS ');
    next();
  });
});

const app_server = server.build();
app_server.listen(config.port);

container
  .get<LoggerService>(TYPES.LoggerService)
  .info(`${process.env.NODE_ENV} Hermes++ is running on ${config.port} :)`);

exports = module.exports = app_server;
