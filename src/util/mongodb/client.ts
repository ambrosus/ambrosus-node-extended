import { injectable } from 'inversify';
import * as MongoPaging from 'mongo-cursor-pagination';
import { Db } from 'mongodb';

import { APIQuery } from '../../model';
import { MongoDBConnection } from './connection';

@injectable()
export class MongoDBClient {
  public db: Db;
  constructor() {
    MongoDBConnection.getConnection(connection => {
      this.db = connection;
    });
  }

  public count(apiQuery: APIQuery, result: (err, rv) => void): void {
    this.db.collection(apiQuery.collection).countDocuments(apiQuery.query, (error, data) => {
      return result(error, data);
    });
  }

  public find(apiQuery: APIQuery, results: (error, data) => void): void {
    MongoPaging.find(this.db.collection(apiQuery.collection), {
      query: apiQuery.query,
      fields: { projection: apiQuery.fields },
      paginatedField: apiQuery.paginationField,
      sortAscending: apiQuery.sortAscending,
      limit: apiQuery.limit,
      next: apiQuery.next,
      previous: apiQuery.previous,
    })
      .then(data => {
        results(undefined, data);
      })
      .catch(err => {
        results(err, undefined);
      });
  }

  public findOne(apiQuery: APIQuery, result: (error, data) => void): void {
    this.db
      .collection(apiQuery.collection)
      .findOne(apiQuery.query, apiQuery.options, (error, data) => {
        return result(error, data);
      });
  }
}
