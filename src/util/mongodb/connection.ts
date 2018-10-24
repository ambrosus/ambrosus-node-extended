import { Db, MongoClient } from 'mongodb';

import { config } from '../../config';
import { ConnectionError } from '../../error';
import * as querystring from 'querystring';

export class MongoDBConnection {
  public static isConnected = false;
  public static db: Db;

  public static getConnection(result: (connection) => void) {
    if (this.isConnected) {
      return result(this.db);
    }
    this.connect((error, db: Db) => {
      return result(this.db);
    });
  }

  private static connect(result: (error, db: Db) => void) {
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
        this.isConnected = true;
        return result(err, this.db);
      }
    );
  }

  private static getConnUrl(): string {
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
