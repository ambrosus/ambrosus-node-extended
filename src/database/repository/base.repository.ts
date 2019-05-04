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

import { inject, injectable, unmanaged } from 'inversify';
import * as _ from 'lodash';
import * as MongoPaging from 'mongo-cursor-pagination';
import {
  InsertOneWriteOpResult,
  DeleteWriteOpResultObject,
  InsertWriteOpResult,
  Db
} from 'mongodb';

import { config } from '../../config';
import { TYPE } from '../../constant';
import { ILogger } from '../../interface/logger.inferface';
import { APIQuery, MongoPagedResult } from '../../model';
import { DBClient } from '../client';
import { getTimestamp } from '../../util';

import { RepositoryError } from '../../errors';
import { DeveloperError } from '../../errors/developer.error';

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
    MongoPaging.config.DEFAULT_LIMIT = +config.paginationDefault;
    MongoPaging.config.MAX_LIMIT = +config.paginationMax;
  }

  get timestampField(): string {
    throw new RepositoryError({
      reason: 'timestampField getter must be overridden!',
    });
  }

  get paginatedField(): string {
    throw new DeveloperError({
      reason: 'paginatedField getter must be overridden!',
    });
  }

  get paginatedAscending(): boolean {
    throw new DeveloperError({
      reason: 'paginatedAscending getter must be overridden!',
    });
  }

  public async getCollection() {
    if (this.collection) {
      return this.collection;
    }
    this.db = await this.client.getConnection();
    this.collection = this.db.collection(this.collectionName);
    return this.collection;
  }

  public async create(item: T): Promise<InsertOneWriteOpResult> {
    const collection = await this.getCollection();

    this.logger.debug(
      `
      ################ create ################
      collection      ${this.collectionName}:
      item:          ${JSON.stringify(item)}
      `
    );
    try {
      const result: InsertOneWriteOpResult = await collection.insertOne(item);
      return result;
    } catch (err) {
      this.logger.captureError(err);
      throw new RepositoryError(err);
    }
  }

  public async createBulk(item: T[]): Promise<number> {
    const collection = await this.getCollection();

    this.logger.debug(
      `
      ################ createBulk ################
      collection      ${this.collectionName}:
      item:          ${JSON.stringify(item)}
      `
    );
    try {
      const result: InsertWriteOpResult = await collection.insertMany(item);
      return result.result.n;
    } catch (err) {
      this.logger.captureError(err);
      throw new RepositoryError(err);
    }
  }

  public async update(
    apiQuery: APIQuery,
    item: T,
    create: boolean = false
  ): Promise<T> {
    const collection = await this.getCollection();

    this.logger.debug(
      `
      ################ update ################
      collection      ${this.collectionName}:
      query:          ${JSON.stringify(apiQuery.query)}
      item:          ${JSON.stringify(item)}
      `
    );
    try {
      const result = await collection.findOneAndUpdate(
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
      throw new RepositoryError(err);
    }
  }

  public async deleteOne(
    apiQuery: APIQuery
  ): Promise<DeleteWriteOpResultObject> {
    const collection = await this.getCollection();

    this.logger.debug(
      `
      ################ deleteOne ################
      collection      ${this.collectionName}:
      query:          ${JSON.stringify(apiQuery.query, null, 2)}
      `
    );

    try {
      const result: DeleteWriteOpResultObject = await collection.deleteOne(
        apiQuery.query
      );
      return result;
    } catch (err) {
      this.logger.captureError(err);
      throw new RepositoryError(err);
    }
  }

  public async count(apiQuery: APIQuery): Promise<number> {
    const collection = await this.getCollection();

    this.logger.debug(
      `
      ################ count ################
      collection      ${this.collectionName}:
      query:    ${JSON.stringify(apiQuery.query, null, 2)}
      `
    );

    try {
      const result = await collection.countDocuments(apiQuery.query);
      return result;
    } catch (err) {
      this.logger.captureError(err);
      throw new RepositoryError(err);
    }
  }

  // TODO: Add accessLevel to aggregates
  // FIXME: Aggregation isn't returning the correct data with paging b/c a limit to the pipeline.
  public async aggregatePaging(apiQuery: APIQuery): Promise<MongoPagedResult> {
    const collection = await this.getCollection();

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
      const result = await MongoPaging.aggregate(collection, {
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
      throw new RepositoryError(err);
    }
  }

  public async aggregate(apiQuery: APIQuery): Promise<any> {
    const collection = await this.getCollection();

    this.logger.debug(
      `
      ################ aggregate ################
      collection      ${this.collectionName}:
      aggregation:    ${JSON.stringify(apiQuery.query, null, 2)}
      `
    );

    try {
      const result = await collection.aggregate(apiQuery.query).toArray();
      return result;
    } catch (err) {
      this.logger.captureError(err);
      throw new RepositoryError(err);
    }
  }

  public async exists(apiQuery: APIQuery): Promise<boolean> {
    const collection = await this.getCollection();

    this.logger.debug(
      `exists for ${this.collectionName}:
      ${JSON.stringify(apiQuery, null, 2)}`
    );
    if (!apiQuery.query.keys.length) {
      throw new RepositoryError({ reason: 'Invalid query for exists' });
    }

    try {
      const result = await collection
        .find(apiQuery.query, { _id: 1 })
        .limit(1)
        .toArray();

      return result.length > 0;
    } catch (err) {
      this.logger.captureError(err);
      throw new RepositoryError(err);
    }
  }

  public async existsOR(obj, ...fields): Promise<boolean> {
    const collection = await this.getCollection();

    const qor = _.reduce(
      fields,
      (rv, field) => {
        if (obj.hasOwnProperty(field) && obj[field]) {
          rv.push({ [field]: obj[field] });
        }
        return rv;
      },
      []
    );

    if (!qor.length) {
      // throw new RepositoryError({ reason: 'Invalid query for existsOR' });
      return;
    }

    this.logger.debug(
      `existsOR for ${this.collectionName}:
      ${JSON.stringify(qor)}`
    );
    try {
      const result = await collection
        .find({ $or: qor }, { _id: 1 })
        .limit(1)
        .toArray();

      return result.length > 0;
    } catch (err) {
      this.logger.captureError(err);
      throw new RepositoryError(err);
    }
  }

  public async distinct(field: string): Promise<any> {
    const collection = await this.getCollection();

    this.logger.debug(
      `
      ################ distinct ################
      collection      ${this.collectionName}:
      field:          ${field}
      `
    );
    try {
      const result = await collection.distinct(field);
      return result;
    } catch (err) {
      this.logger.captureError(err);
      throw new RepositoryError(err);
    }
  }

  public async search(apiQuery: APIQuery): Promise<MongoPagedResult> {
    const collection = await this.getCollection();

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
      const result = await MongoPaging.search(collection, apiQuery.search, {
        query: apiQuery.query,
        fields: apiQuery.fields,
        limit: apiQuery.limit,
        next: apiQuery.next,
        previous: apiQuery.previous,
      });
      return result;
    } catch (err) {
      this.logger.captureError(err);
      throw new RepositoryError(err);
    }
  }

  public async findWithPagination(apiQuery: APIQuery): Promise<MongoPagedResult> {
    const collection = await this.getCollection();

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
      const result = await MongoPaging.find(collection, {
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
      throw new RepositoryError(err);
    }
  }

  public async find(apiQuery: APIQuery): Promise<T[]> {
    const collection = await this.getCollection();

    this.logger.debug(
      `
      ################ find ################
      collection      ${this.collectionName}:
      query:          ${JSON.stringify(apiQuery.query, null, 2)}
      fields:         ${JSON.stringify(apiQuery.fields, null, 2)}
      paginatedField: ${this.paginatedField}
      sortAscending:  ${this.paginatedAscending}
      `
    );

    const projection = Object.keys(apiQuery.fields).length
      ? { projection: apiQuery.fields }
      : undefined;
    try {
      const result = await collection
        .find(apiQuery.query, projection)
        .toArray();

      return result;
    } catch (err) {
      this.logger.captureError(err);
      throw new RepositoryError(err);
    }
  }

  public async findOne(apiQuery: APIQuery): Promise<T> {
    const collection = await this.getCollection();

    this.logger.debug(
      `
      ################ findOne ################
      collection      ${this.collectionName}:
      query:          ${JSON.stringify(apiQuery.query, null, 2)}
      fields:         ${JSON.stringify(apiQuery.fields, null, 2)}
      `
    );
    try {
      const result = await collection
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
      throw new RepositoryError(err);
    }
  }

  public async findOneOrCreate(
    apiQuery: APIQuery,
    createUser: string
  ): Promise<T> {
    const collection = await this.getCollection();

    this.logger.debug(
      `
      ################ findOneOrCreate ################
      collection      ${this.collectionName}:
      query:          ${JSON.stringify(apiQuery.query, null, 2)}
      fields:         ${JSON.stringify(apiQuery.fields, null, 2)}
      `
    );
    try {
      const result = await collection.findOneAndUpdate(
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
      throw new RepositoryError(err);
    }
  }
}
