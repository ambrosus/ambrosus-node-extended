import { injectable } from 'inversify';
import { Db, MongoClient } from 'mongodb';
import * as querystring from 'querystring';

import { config } from '../config';
import { ConnectionError } from '../model';

@injectable()
export class DBClient {
  public db: Db;
  constructor() {
    const connStr = this.getConnUrl();
    const dbName = config.db.dbName;

    MongoClient.connect(
      connStr,
      { useNewUrlParser: true },
      (err, client) => {
        if (err) {
          throw new ConnectionError(err.message);
        }
        this.db = client.db(dbName);
      }
    );
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
