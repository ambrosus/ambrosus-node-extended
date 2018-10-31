import { inject, injectable, unmanaged } from 'inversify';
import * as MongoPaging from 'mongo-cursor-pagination';
import { InsertOneWriteOpResult } from 'mongodb';

import { TYPE } from '../../constant';
import { ILogger } from '../../interface/logger.inferface';
import { APIQuery, APIResult, ConnectionError } from '../../model';
import { DBClient } from '../client';

import * as _ from 'lodash';

@injectable()
export class BaseRepository<T> {
  @inject(TYPE.LoggerService)
  public logger: ILogger;

  constructor(
    @inject(TYPE.DBClient) protected client: DBClient,
    @unmanaged() protected collectionName: string
  ) {}

  get collection(): any {
    if (!this.client) {
      throw new ConnectionError('Database client not initialized');
    }
    return this.client.db.collection(this.collectionName);
  }

  public async create(item: T): Promise<boolean> {
    const result: InsertOneWriteOpResult = await this.collection.insert(item);
    return !!result.result.ok;
  }

  public update(id: string, item: T): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
  public delete(id: string): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  public count(query: object): Promise<number> {
    return this.collection.countDocuments(query);
  }

  // TODO: Add accessLevel to aggregates
  public aggregatePaging(pipeline: object, apiQuery: APIQuery): Promise<APIResult> {
    this.logger.debug(
      `aggregate ${this.collectionName}: ${JSON.stringify(pipeline)} ${JSON.stringify(apiQuery)}`
    );
    return MongoPaging.aggregate(this.collection, {
      aggregation: pipeline,
      paginatedField: apiQuery.paginationField,
      limit: apiQuery.limit,
      next: apiQuery.next,
      previous: apiQuery.previous,
    });
  }

  // TODO: Add accessLevel to aggregates
  public aggregate(pipeline: object, apiQuery: APIQuery): Promise<any> {
    this.logger.debug(
      `aggregate ${this.collectionName}: ${JSON.stringify(pipeline)} ${JSON.stringify(apiQuery)}`
    );
    return this.collection.aggregate(pipeline).toArray();
  }

  public async exists(query: object): Promise<boolean> {
    this.logger.debug(
      `exists for ${this.collectionName}:
      ${JSON.stringify(query)}`
    );
    return this.collection
      .find(query, { _id: 1 })
      .limit(1)
      .toArray()
      .then(arrs => {
        return Promise.resolve(arrs.length > 0);
      });
  }

  public async existsOR(obj, ...fields): Promise<boolean> {
    const qor = _.map(fields, field => {
      return { [field]: obj[field] };
    });
    this.logger.debug(
      `existsOR for ${this.collectionName}:
      ${JSON.stringify(qor)}`
    );
    return this.collection
    .find({$or: qor}, { _id: 1 })
    .limit(1)
    .toArray()
    .then(arrs => {
      return Promise.resolve(arrs.length > 0);
    });
  }

  protected find(
    findQuery: object,
    findFields: object,
    findPaginationField: string,
    findSortAsc: boolean,
    findLimit: number,
    findNext: string,
    findPrevious: string
  ): Promise<APIResult> {
    this.logger.debug(
      `find for ${this.collectionName}:
      ${JSON.stringify(findQuery)}
      ${JSON.stringify(findFields)}
      ${findPaginationField}
      ${findSortAsc}
      ${findLimit}
      ${findNext}
      ${findPrevious}`
    );
    return MongoPaging.find(this.collection, {
      query: findQuery,
      fields: findFields,
      paginatedField: findPaginationField,
      sortAscending: findSortAsc,
      limit: findLimit,
      next: findNext,
      previous: findPrevious,
    });
  }

  protected findOne(query: object, options: object) {
    this.logger.debug(
      `findOne for ${this.collectionName}:
      ${JSON.stringify(query)}
      ${JSON.stringify(options)}`
    );
    return this.collection
      .find(query, options)
      .limit(1)
      .toArray()
      .then(arrs => {
        return arrs[0] || undefined;
      });
  }
}
