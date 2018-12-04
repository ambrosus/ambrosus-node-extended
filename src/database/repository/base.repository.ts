import { inject, injectable, unmanaged } from 'inversify';
import * as _ from 'lodash';
import * as MongoPaging from 'mongo-cursor-pagination';
import {
  InsertOneWriteOpResult,
  DeleteWriteOpResultObject,
  InsertWriteOpResult,
  Db,
} from 'mongodb';

import { config } from '../../config';
import { TYPE } from '../../constant';
import { ILogger } from '../../interface/logger.inferface';
import { APIQuery, MongoPagedResult } from '../../model';
import { DBClient } from '../client';
import { getTimestamp } from '../../util';
import { RepositoryError } from '../../model/error/repository.error';

@injectable()
export class BaseRepository<T> {
  public db: Db;
  public collection: any;

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
    throw new RepositoryError({ reason: 'timestampField getter must be overridden!' });
  }

  get paginatedField(): string {
    throw new Error('paginatedField getter must be overridden!');
  }

  get paginatedAscending(): boolean {
    throw new Error('paginatedAscending getter must be overridden!');
  }

  public async getConnection() {
    this.db = await this.client.getConnection();
    this.collection = this.db.collection(this.collectionName);
  }

  public async create(item: T): Promise<InsertOneWriteOpResult> {
    await this.getConnection();

    this.logger.debug(
      `
      ################ create ################
      collection      ${this.collectionName}:
      item:          ${JSON.stringify(item)}
      `
    );
    try {
      const result: InsertOneWriteOpResult = await this.collection.insertOne(item);
      return result;
    } catch (err) {
      this.logger.captureError(err);
      throw new RepositoryError(err.message);
    }
  }

  public async createBulk(item: T[]): Promise<number> {
    await this.getConnection();

    this.logger.debug(
      `
      ################ createBulk ################
      collection      ${this.collectionName}:
      item:          ${JSON.stringify(item)}
      `
    );
    try {
      const result: InsertWriteOpResult = await this.collection.insertMany(item);
      return result.result.n;
    } catch (err) {
      this.logger.captureError(err);
      throw new RepositoryError(err.message);
    }
  }

  public async update(apiQuery: APIQuery, item: T, create: boolean = false): Promise<T> {
    await this.getConnection();

    this.logger.debug(
      `
      ################ update ################
      collection      ${this.collectionName}:
      query:          ${JSON.stringify(apiQuery.query)}
      item:          ${JSON.stringify(item)}
      `
    );
    try {
      const result = await this.collection.findOneAndUpdate(
        apiQuery.query,
        { $set: item },
        {
          returnOriginal: false,
          upsert: create,
        }
      );
      return result.value;
    } catch (err) {
      this.logger.captureError(err);
      throw new RepositoryError(err.message);
    }
  }

  public async deleteOne(apiQuery: APIQuery): Promise<DeleteWriteOpResultObject> {
    await this.getConnection();

    this.logger.debug(
      `
      ################ deleteOne ################
      collection      ${this.collectionName}:
      query:          ${JSON.stringify(apiQuery.query, null, 2)}
      `
    );

    try {
      const result: DeleteWriteOpResultObject = await this.collection.deleteOne(apiQuery.query);
      return result;
    } catch (err) {
      this.logger.captureError(err);
      throw new RepositoryError(err.message);
    }
  }

  public async count(apiQuery: APIQuery): Promise<number> {
    await this.getConnection();

    this.logger.debug(
      `
      ################ count ################
      collection      ${this.collectionName}:
      query:    ${JSON.stringify(apiQuery.query, null, 2)}
      `
    );

    try {
      const result = await this.collection.countDocuments(apiQuery.query);
      return result;
    } catch (err) {
      this.logger.captureError(err);
      throw new RepositoryError(err.message);
    }
  }

  // TODO: Add accessLevel to aggregates
  // FIXME: Aggregation isn't returning the correct data with paging b/c a limit to the pipeline.
  public async aggregatePaging(apiQuery: APIQuery): Promise<MongoPagedResult> {
    await this.getConnection();

    this.logger.debug(
      `
      ################ aggregatePaging ################
      collection      ${this.collectionName}:
      aggregation:    ${JSON.stringify(apiQuery.query, null, 2)}
      paginatedField: ${this.paginatedField}
      sortAscending:  ${this.paginatedAscending}
      limit:          ${apiQuery.limit}
      next:           ${apiQuery.next}
      previous:       ${apiQuery.previous}
      `
    );
    try {
      const result = await MongoPaging.aggregate(this.collection, {
        aggregation: apiQuery.query,
        paginatedField: this.paginatedField,
        paginatedAscending: this.paginatedAscending,
        limit: apiQuery.limit,
        next: apiQuery.next,
        previous: apiQuery.previous,
      });
      return result;
    } catch (err) {
      this.logger.captureError(err);
      throw new RepositoryError(err.message);
    }
  }

  public async aggregate(apiQuery: APIQuery): Promise<any> {
    await this.getConnection();

    this.logger.debug(
      `
      ################ aggregate ################
      collection      ${this.collectionName}:
      aggregation:    ${JSON.stringify(apiQuery.query, null, 2)}
      `
    );

    try {
      const result = await this.collection.aggregate(apiQuery.query).toArray();
      return result;
    } catch (err) {
      this.logger.captureError(err);
      throw new RepositoryError(err.message);
    }
  }

  public async exists(apiQuery: APIQuery): Promise<boolean> {
    await this.getConnection();

    this.logger.debug(
      `exists for ${this.collectionName}:
      ${JSON.stringify(apiQuery, null, 2)}`
    );
    if (!apiQuery.query.keys.length) {
      throw new RepositoryError('Invalid query for exists');
    }
    try {
      const result = await this.collection
        .find(apiQuery.query, { _id: 1 })
        .limit(1)
        .toArray();

      return result.length > 0;
    } catch (err) {
      this.logger.captureError(err);
      throw new RepositoryError(err.message);
    }
  }

  public async existsOR(obj, ...fields): Promise<boolean> {
    await this.getConnection();

    const qor = _.reduce(
      fields,
      (rv, field) => {
        if (obj.hasOwnProperty(field)) {
          rv.push({ [field]: obj[field] });
        }
        return rv;
      },
      []
    );

    if (!qor.length) {
      throw new RepositoryError('Invalid query for existsOR');
    }

    this.logger.debug(
      `existsOR for ${this.collectionName}:
      ${JSON.stringify(qor)}`
    );
    try {
      const result = await this.collection
        .find({ $or: qor }, { _id: 1 })
        .limit(1)
        .toArray();

      return result.length > 0;
    } catch (err) {
      this.logger.captureError(err);
      throw new RepositoryError(err.message);
    }
  }

  public async distinct(field: string): Promise<any> {
    await this.getConnection();

    this.logger.debug(
      `
      ################ distinct ################
      collection      ${this.collectionName}:
      field:          ${field}
      `
    );
    try {
      const result = await this.collection.distinct(field);
      return result;
    } catch (err) {
      this.logger.captureError(err);
      throw new RepositoryError(err.message);
    }
  }

  public async search(apiQuery: APIQuery): Promise<MongoPagedResult> {
    await this.getConnection();

    this.logger.debug(
      `
      ################ search ################
      collection      ${this.collectionName}:
      search:         ${JSON.stringify(apiQuery.search, null, 2)}
      query:          ${JSON.stringify(apiQuery.query, null, 2)}
      fields:         ${JSON.stringify(apiQuery.fields, null, 2)}
      paginatedField: ${this.paginatedField}
      sortAscending:  ${this.paginatedAscending}
      limit:          ${apiQuery.limit}
      next:           ${apiQuery.next}
      previous:       ${apiQuery.previous}
      `
    );

    try {
      const result = await MongoPaging.search(this.collection, apiQuery.search, {
        query: apiQuery.query,
        fields: apiQuery.fields,
        limit: apiQuery.limit,
        next: apiQuery.next,
        previous: apiQuery.previous,
      });
      return result;
    } catch (err) {
      this.logger.captureError(err);
      throw new RepositoryError(err.message);
    }
  }

  public async find(apiQuery: APIQuery): Promise<MongoPagedResult> {
    await this.getConnection();

    this.logger.debug(
      `
      ################ find ################
      collection      ${this.collectionName}:
      query:          ${JSON.stringify(apiQuery.query, null, 2)}
      fields:         ${JSON.stringify(apiQuery.fields, null, 2)}
      paginatedField: ${this.paginatedField}
      sortAscending:  ${this.paginatedAscending}
      limit:          ${apiQuery.limit}
      next:           ${apiQuery.next}
      previous:       ${apiQuery.previous}
      `
    );

    const projection = Object.keys(apiQuery.fields).length
      ? { projection: apiQuery.fields }
      : undefined;
    try {
      const result = await MongoPaging.find(this.collection, {
        query: apiQuery.query,
        fields: projection,
        paginatedField: this.paginatedField,
        sortAscending: this.paginatedAscending,
        limit: apiQuery.limit,
        next: apiQuery.next,
        previous: apiQuery.previous,
      });

      return result;
    } catch (err) {
      this.logger.captureError(err);
      throw new RepositoryError(err.message);
    }
  }

  public async findOne(apiQuery: APIQuery): Promise<T> {
    await this.getConnection();

    this.logger.debug(
      `
      ################ findOne ################
      collection      ${this.collectionName}:
      query:          ${JSON.stringify(apiQuery.query, null, 2)}
      fields:         ${JSON.stringify(apiQuery.fields, null, 2)}
      `
    );
    try {
      const result = await this.collection
        .find(apiQuery.query, { projection: apiQuery.fields })
        .limit(1)
        .toArray();

      this.logger.debug(
        `
      ${JSON.stringify(result, null, 2)}
      ################ result ################
      `
      );

      return result[0] || undefined;
    } catch (err) {
      this.logger.captureError(err);
      throw new RepositoryError(err.message);
    }
  }

  public async findOneOrCreate(apiQuery: APIQuery, createUser: string): Promise<T> {
    await this.getConnection();

    this.logger.debug(
      `
      ################ findOneOrCreate ################
      collection      ${this.collectionName}:
      query:          ${JSON.stringify(apiQuery.query, null, 2)}
      fields:         ${JSON.stringify(apiQuery.fields, null, 2)}
      `
    );
    try {
      const result = await this.collection.findOneAndUpdate(
        apiQuery.query,
        { $setOnInsert: { createdOn: getTimestamp(), createdBy: createUser } },
        {
          upsert: true,
          returnOriginal: false,
        }
      );
      return result.value;
    } catch (err) {
      this.logger.captureError(err);
      throw new RepositoryError(err.message);
    }
  }
}
