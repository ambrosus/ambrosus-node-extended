/*
 * Copyright: Ambrosus Inc.
 * Email: tech@ambrosus.com
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

import { injectable, inject } from 'inversify';
import { Db, MongoClient } from 'mongodb';
import * as querystring from 'querystring';

import { config } from '../config';
import { EventEmitter } from 'events';
import * as Sentry from '@sentry/node';
import { TYPE } from '../constant';
import { LoggerService } from '../service/logger.service';

import { ConnectionError } from '../errors';

type DBClientProvider = () => Promise<DBClient>;

@injectable()
export class DBClient {
  public db: Db;
  public events: EventEmitter;
  public connected: boolean;
  public mongoClient: MongoClient;

  constructor(
    @inject(TYPE.LoggerService) private logger: LoggerService
  ) { }

  public getConnection(): Promise<Db> {
    return new Promise(async (resolve, reject) => {
      if (this.connected) { return resolve(this.db); }
      try {
        const db = await this.connect();
        return resolve(db);
      } catch (e) {
        throw new ConnectionError('Database failed to connect');
      }
    });
  }

  private connect(): Promise<any> {
    return new Promise(async (resolve, reject) => {
      this.events = new EventEmitter();
      const connStr = this.getConnUrl();
      const dbName = config.db.dbName;

      await MongoClient.connect(connStr,
        {
          useNewUrlParser: true,
          reconnectTries: 10,
          reconnectInterval: 1000,
        },
        (err, client) => {
          if (err) {
            Sentry.captureException(err);
            throw new ConnectionError(err);
          }
          this.logger.info('Database connected');

          client.on('close', () => {
            this.logger.warn('Database connection closed');
            this.events.emit('dbDisconnected');
            this.connected = false;
            setTimeout(() => {
              if (!this.connected) { throw new ConnectionError('Database reconnect failed'); }
            }, 10000);
          });
          client.on('reconnect', () => {
            this.logger.info('Database reconnected');
            this.events.emit('dbReconnected');
            this.connected = true;
          });

          this.mongoClient = client;
          this.db = client.db(dbName);
          this.connected = true;
          this.events.emit('dbConnected');
          return resolve(this.db);
        });
    });
  }

  private getConnUrl(): string {
    const query = {};
    let credentials = '';

    if (config.db.resplicaset) {
      query['replicaSet'] = config.db.resplicaset;
    }

    if (config.db.user) {
      const user = encodeURIComponent(config.db.user);
      const password = encodeURIComponent(config.db.pass);
      credentials = `${user}:${password}@`;

      query['authSource'] = 'admin';
    }

    const queryStr = `?${querystring.stringify(query)}`;
    return `mongodb://${credentials}${config.db.hosts}/${queryStr}`;
  }
}
