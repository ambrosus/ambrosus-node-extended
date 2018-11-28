import { injectable, inject } from 'inversify';
import { Db, MongoClient } from 'mongodb';
import * as querystring from 'querystring';

import { config } from '../config';
import { ConnectionError } from '../model';
import { EventEmitter } from 'events';
import * as Sentry from '@sentry/node';
import { TYPE } from '../constant';
import { LoggerService } from '../service/logger.service';

type DBClientProvider = () => Promise<DBClient>;

@injectable()
export class DBClient {
  public db: Db;
  public events: EventEmitter;
  public connected: boolean;
  public mongoClient: MongoClient;

  constructor(
    @inject(TYPE.LoggerService) private logger: LoggerService
  ) {
    this.connect();
  }

  public async getConnection(): Promise<Db> {
    if (this.connected) { return this.db; }
    try {
      const db = await this.connect();
      return db;
    } catch (e) {
      throw new ConnectionError('Database failed to connect');
    }
  }

  private async connect(): Promise<any> {
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
        return this.db;
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
