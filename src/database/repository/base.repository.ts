import { inject, injectable, unmanaged } from 'inversify';
import * as _ from 'lodash';
import * as MongoPaging from 'mongo-cursor-pagination';
import { InsertOneWriteOpResult } from 'mongodb';

import { config } from '../../config';
import { TYPE } from '../../constant';
import { ILogger } from '../../interface/logger.inferface';
import { APIQuery, ConnectionError, MongoPagedResult } from '../../model';
import { DBClient } from '../client';

@injectable()
export class BaseRepository<T> {
  @inject(TYPE.LoggerService)
  public logger: ILogger;

  constructor(
    @inject(TYPE.DBClient) protected client: DBClient,
    @unmanaged() protected collectionName: string
  ) {
    MongoPaging.config.DEFAULT_LIMIT = config.paginationDefault;
    MongoPaging.config.MAX_LIMIT = config.paginationMax;
  }

  get timestampField(): string {
    // For when we have a system control creation date
    return this.paginatedField;
  }

  get paginatedField(): string {
    throw new Error('paginatedField getter must be overridden!');
  }

  get paginatedAscending(): boolean {
    throw new Error('paginatedAscending getter must be overridden!');
  }

  get collection(): any {
    if (!this.client) {
      throw new ConnectionError('Database client not initialized');
    }
    return this.client.db.collection(this.collectionName);
  }

  public async create(item: T): Promise<boolean> {
    const result: InsertOneWriteOpResult = await this.collection.insertOne(item);
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
  // FIXME: Aggregation isn't returning the correct data with paging b/c a limit to the pipeline.
  public aggregatePaging(apiQuery: APIQuery): Promise<MongoPagedResult> {
    this.logger.debug(`aggregate ${this.collectionName}: ${JSON.stringify(apiQuery)}`);
    return MongoPaging.aggregate(this.collection, {
      aggregation: apiQuery.query,
      paginatedField: this.paginatedField,
      paginatedAscending: this.paginatedAscending,
      limit: apiQuery.limit,
      next: apiQuery.next,
      previous: apiQuery.previous,
    });
  }

  // TODO: Add accessLevel to aggregates
  public aggregate(apiQuery: APIQuery): Promise<any> {
    this.logger.debug(`aggregate ${this.collectionName}: ${JSON.stringify(apiQuery)}`);
    return this.collection.aggregate(apiQuery.query).toArray();
  }

  public async exists(apiQuery: APIQuery): Promise<boolean> {
    this.logger.debug(
      `exists for ${this.collectionName}:
      ${JSON.stringify(apiQuery)}`
    );
    return this.collection
      .find(apiQuery.query, { _id: 1 })
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
      .find({ $or: qor }, { _id: 1 })
      .limit(1)
      .toArray()
      .then(arrs => {
        return Promise.resolve(arrs.length > 0);
      });
  }

  public async find(apiQuery: APIQuery): Promise<MongoPagedResult> {
    this.logger.debug(
      `
      ################ find ################
      collection      ${this.collectionName}:
      query:          ${JSON.stringify(apiQuery.query)}
      fields:         ${JSON.stringify(apiQuery.fields)}
      paginatedField: ${this.paginatedField}
      sortAscending:  ${this.paginatedAscending}
      limit:          ${apiQuery.limit}
      next:           ${apiQuery.next}
      previous:       ${apiQuery.previous}
      `
    );

    return MongoPaging.find(this.collection, {
      query: apiQuery.query,
      fields: { projection: apiQuery.fields },
      paginatedField: this.paginatedField,
      sortAscending: this.paginatedAscending,
      limit: apiQuery.limit,
      next: apiQuery.next,
      previous: apiQuery.previous,
    });
  }

  public async findOne(apiQuery: APIQuery): Promise<T> {
    this.logger.debug(
      `
      ################ findOne ################
      collection      ${this.collectionName}:
      query:          ${JSON.stringify(apiQuery.query)}
      fields:         ${JSON.stringify(apiQuery.fields)}
      `
    );
    return this.collection
      .find(apiQuery.query, { projection: apiQuery.fields })
      .limit(1)
      .toArray()
      .then(arrs => {
        return arrs[0] || undefined;
      });
  }
}
