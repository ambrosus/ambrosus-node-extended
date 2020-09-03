/*
 * Copyright: Ambrosus Inc.
 * Email: tech@ambrosus.io
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files
 * (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

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
import * as Sentry from '@sentry/node';
import * as sgMail from '@sendgrid/mail';
import { DBClient } from './database/client';
import { errorHandler } from './middleware';
import { BuiltInService } from './service/builtin.service';
import { EmailService } from './service/email.service';

import Migrator from './migrations/Migrator';

import * as express from 'express';

import * as pack from '../package.json';

// tslint:disable-next-line:no-var-requires
const fs = require('fs');

const dashboardStatic = '/var/www/dashboard';

if (config.email.api) {
  sgMail.setApiKey(config.email.api);
}

if (config.sentryDsn) {
  Sentry.init({
    dsn: config.sentryDsn,
    environment: process.env.NODE_ENV,
  });
}

const server = new InversifyExpressServer(
  iocContainer,
  undefined,
  undefined,
  undefined,
  AMBAccountProvider
);

const logger = iocContainer.get<LoggerService>(TYPE.LoggerService);

const client: DBClient = iocContainer.get<DBClient>(TYPE.DBClient);
client.getConnection().then();

client.events.on('dbConnected', async () => {
  try {
    const migrator = new Migrator(client.db, config, 'migration.server');

    await migrator.migrate(logger);
  } catch (e) {
    logger.error(`ERROR(Migration) ${e}`);
  }
});

const builtInService = iocContainer.get<BuiltInService>(TYPE.BuiltInService);
builtInService.checkBuiltIn().then();

const emailService = iocContainer.get<EmailService>(TYPE.EmailService);
emailService.paramsCheck();

server.setConfig(app => {
  logger.info(`version: ${pack.version}`);

  if (config.useStatic === 1) {
    logger.info('staticDashboard: ENABLED');

    app.use('/dashboard', express.static(dashboardStatic));
  }

  app.use(Sentry.Handlers.requestHandler());
  app.use(Sentry.Handlers.errorHandler());
  app.set('json spaces', 2);
  app.use(
    bodyParser.urlencoded({
      extended: true,
    })
  );
  app.use(bodyParser.json({ limit: '16mb' }));
  if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('combined'));
  }
  app.use(cors());
  app.use((req, res, next) => {
    res.set('cache-control', 'no-store');
    next();
  });
  app.on('error', (err: any) => {
    switch (err.code) {
      case 'EACCES':
        logger.error(`${config.port} requires elevated privileges`);
        process.exit(1);
        break;

      case 'EADDRINUSE':
        logger.error(`${config.port} is already in use`);
        process.exit(1);
        break;

      default:
        throw err;
    }
  });
});

function handler404(request, response) {
  if (request.accepts('html')) {
    logger.debug('REDIRECT(404)', request.url);

    fs.readFile(`${dashboardStatic}/index.html`, 'utf-8',
      (err, data) => {
        response.writeHead(404, {'Content-Type': 'text/html'});
        response.write(data);
        response.end();
      }
    );
  }
}

server.setErrorConfig(app => {
  app.use(errorHandler);

  if (config.useStatic === 1) {
    app.get('*', handler404);
  }
});

// Server errors
process.on('unhandledRejection', error => {
  logger.error('unhandledRejection event: ', error);
  Sentry.captureException(error);
});

process.on('uncaughtException', error => {
  console.log(error.toString());
  logger.error('uncaughtException event: ', error);
  Sentry.captureException(error);
});

if (config.test.mode === 1) {
  logger.info('testMode: ENABLED');
}

export const app_server = server.build();

app_server.listen(config.port);

logger.info(`${process.env.NODE_ENV} Hermes++ is running on ${config.port} :)`);
