import { inject, injectable, unmanaged } from 'inversify';
import * as MongoPaging from 'mongo-cursor-pagination';
import { InsertOneWriteOpResult } from 'mongodb';

import { TYPES } from '../../constant';
import { ConnectionError } from '../../error';
import { ILogger } from '../../interface/logger.inferface';
import { APIQuery, APIResult } from '../../model';
import { DBClient } from '../client';

@injectable()
export class BaseRepository<T> {
  @inject(TYPES.LoggerService)
  public logger: ILogger;

  constructor(
    @inject(TYPES.DBClient) protected client: DBClient,
    @unmanaged() protected collectionName: string
  ) {}

  get collection(): any {
    if (!this.client) {
      throw new ConnectionError('Database client not initialized');
    }
    return this.client.db.collection(this.collectionName);
  }

  get timestampField(): any {
    throw new Error('timestampField getter must be overridden!');
  }

  get accessLevelField(): any {
    throw new Error('accessLevelField getter must be overridden!');
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

  public query(apiQuery: APIQuery, accessLevel: number): Promise<APIResult> {
    const q = {
      ...apiQuery.query,
      ...{
        [this.accessLevelField]: { $gte: accessLevel },
      },
    };
    return this.pagedResults(
      q,
      apiQuery.fields,
      apiQuery.paginationField,
      apiQuery.sortAscending,
      apiQuery.limit,
      apiQuery.next,
      apiQuery.previous
    );
  }

  public single(apiQuery: APIQuery, accessLevel: number): Promise<T> {
    const q = {
      ...apiQuery.query,
      ...{
        [this.accessLevelField]: { $gte: accessLevel },
      },
    };
    return this.singleResult(q, apiQuery.options);
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

  protected pagedResults(
    query: object,
    fields: object,
    pageField: string,
    sortAsc: boolean,
    limit: number,
    next: string,
    previous: string
  ): Promise<APIResult> {
    this.logger.debug(
      `pagedResults for ${this.collectionName}:
      ${JSON.stringify(query)}
      ${JSON.stringify(fields)}
      ${pageField}
      ${sortAsc}
      ${limit}
      ${next}
      ${previous}`
    );
    return MongoPaging.find(this.collection, {
      query,
      fields,
      pageField,
      sortAsc,
      limit,
      next,
      previous,
    });
  }

  protected singleResult(query: object, options: object) {
    this.logger.debug(
      `singleResult for ${this.collectionName}:
      ${JSON.stringify(query)}
      ${JSON.stringify(options)}`
    );
    return this.collection.findOne(query, options);
  }
}
