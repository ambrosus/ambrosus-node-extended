import { inject, injectable, unmanaged } from 'inversify';
import * as _ from 'lodash';
import * as MongoPaging from 'mongo-cursor-pagination';
import { InsertOneWriteOpResult } from 'mongodb';

import { config } from '../../config';
import { TYPE } from '../../constant';
import { ILogger } from '../../interface/logger.inferface';
import { APIQuery, ConnectionError, MongoPagedResult } from '../../model';
import { DBClient } from '../client';
import { getTimestamp } from '../../util/helpers';

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
    this.logger.debug(
      `
      ################ create ################
      collection      ${this.collectionName}:
      item:          ${JSON.stringify(item)}
      `
    );

    const result: InsertOneWriteOpResult = await this.collection.insertOne(item);
    return !!result.result.ok;
  }

  public async update(apiQuery: APIQuery, item: T, create: boolean = false): Promise<T> {
    this.logger.debug(
      `
      ################ update ################
      collection      ${this.collectionName}:
      query:          ${JSON.stringify(apiQuery.query)}
      item:          ${JSON.stringify(item)}
      `
    );

    const result = await this.collection.findOneAndUpdate(
      apiQuery.query,
      { $set: item },
      {
        returnOriginal: false,
        upsert: create,
      }
    );
    return result.value;
  }

  public delete(id: string): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  public count(query: object): Promise<number> {
    return this.collection.countDocuments(query);
  }

  // TODO: Add accessLevel to aggregates
  // FIXME: Aggregation isn't returning the correct data with paging b/c a limit to the pipeline.
  public async aggregatePaging(apiQuery: APIQuery): Promise<MongoPagedResult> {
    this.logger.debug(
      `
      ################ aggregatePaging ################
      collection      ${this.collectionName}:
      aggregation:    ${JSON.stringify(apiQuery.query)}
      paginatedField: ${this.paginatedField}
      sortAscending:  ${this.paginatedAscending}
      limit:          ${apiQuery.limit}
      next:           ${apiQuery.next}
      previous:       ${apiQuery.previous}
      `
    );

    const result = await MongoPaging.aggregate(this.collection, {
      aggregation: apiQuery.query,
      paginatedField: this.paginatedField,
      paginatedAscending: this.paginatedAscending,
      limit: apiQuery.limit,
      next: apiQuery.next,
      previous: apiQuery.previous,
    });
    return result;
  }

  public async aggregate(apiQuery: APIQuery): Promise<any> {
    this.logger.debug(
      `
      ################ aggregate ################
      collection      ${this.collectionName}:
      aggregation:    ${JSON.stringify(apiQuery.query)}
      `
    );

    const result = await this.collection.aggregate(apiQuery.query).toArray();
    return result;
  }

  public async exists(apiQuery: APIQuery): Promise<boolean> {
    this.logger.debug(
      `exists for ${this.collectionName}:
      ${JSON.stringify(apiQuery)}`
    );
    const result = await this.collection
      .find(apiQuery.query, { _id: 1 })
      .limit(1)
      .toArray();

    return result.length > 0;
  }

  public async existsOR(obj, ...fields): Promise<boolean> {
    const qor = _.map(fields, field => {
      return { [field]: obj[field] };
    });
    this.logger.debug(
      `existsOR for ${this.collectionName}:
      ${JSON.stringify(qor)}`
    );
    const result = await this.collection
      .find({ $or: qor }, { _id: 1 })
      .limit(1)
      .toArray();

    return result.length > 0;
  }

  public async distinct(field: string): Promise<any> {
    this.logger.debug(
      `
      ################ distinct ################
      collection      ${this.collectionName}:
      field:          ${field}
      `
    );
    const result = await this.collection.distinct(field);
    return result;
  }

  public async search(apiQuery: APIQuery): Promise<MongoPagedResult> {
    this.logger.debug(
      `
      ################ search ################
      collection      ${this.collectionName}:
      search:         ${JSON.stringify(apiQuery.search)}
      query:          ${JSON.stringify(apiQuery.query)}
      fields:         ${JSON.stringify(apiQuery.fields)}
      paginatedField: ${this.paginatedField}
      sortAscending:  ${this.paginatedAscending}
      limit:          ${apiQuery.limit}
      next:           ${apiQuery.next}
      previous:       ${apiQuery.previous}
      `
    );

    const result = await MongoPaging.search(this.collection, apiQuery.search, {
      query: apiQuery.query,
      fields: apiQuery.fields,
      limit: apiQuery.limit,
      next: apiQuery.next,
      previous: apiQuery.previous,
    });
    return result;
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

    const result = await MongoPaging.find(this.collection, {
      query: apiQuery.query,
      fields: { projection: apiQuery.fields },
      paginatedField: this.paginatedField,
      sortAscending: this.paginatedAscending,
      limit: apiQuery.limit,
      next: apiQuery.next,
      previous: apiQuery.previous,
    });
    return result;
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
    const result = await this.collection
      .find(apiQuery.query, { projection: apiQuery.fields })
      .limit(1)
      .toArray();

    return result[0] || undefined;
  }

  public async findOneOrCreate(apiQuery: APIQuery, createUser: string): Promise<T> {
    this.logger.debug(
      `
      ################ findOneOrCreate ################
      collection      ${this.collectionName}:
      query:          ${JSON.stringify(apiQuery.query)}
      fields:         ${JSON.stringify(apiQuery.fields)}
      `
    );
    const result = await this.collection.findOneAndUpdate(
      apiQuery.query,
      { $setOnInsert: { createdOn: getTimestamp(), createdBy: createUser } },
      {
        upsert: true,
        returnOriginal: false,
      }
    );
    return result.value;
  }
}
