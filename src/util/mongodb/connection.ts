import { Db, MongoClient } from 'mongodb';

import { config } from '../../config';
import { ConnectionError } from '../../error';
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
    const connStr = `mongodb://${config.db.hosts}`;
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
}
