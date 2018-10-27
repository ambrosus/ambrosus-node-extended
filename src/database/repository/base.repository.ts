import { inject, injectable, unmanaged } from 'inversify';
import * as MongoPaging from 'mongo-cursor-pagination';

import { TYPES } from '../../constant';
import { ConnectionError, ValidationError } from '../../error';
import { ILogger } from '../../interface/logger.inferface';
import { APIQuery, APIResult } from '../../model';
import { MongoClient, Db, Collection, InsertOneWriteOpResult } from 'mongodb';

import {
  getTimestamp,
  getTimestampDateEnd,
  getTimestampDateStart,
  getTimestampMonthStart,
  getTimestampSubDays,
  getTimestampSubHours,
  getTimestampSubWeeks,
  isValidDate,
} from '../../util/helpers';
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

  public aggregate(pipeline: object, apiQuery: APIQuery): Promise<any> {
    this.logger.debug(
      `aggregate ${this.collectionName}: ${JSON.stringify(pipeline)} ${JSON.stringify(apiQuery)}`
    );
    return this.collection.aggregate(pipeline).toArray();
  }

  public count(): Promise<number> {
    this.logger.debug(`count ${this.collectionName}`);
    return this.collection.countDocuments();
  }

  public countQuery(apiQuery: APIQuery): Promise<number> {
    this.logger.debug(`countQuery ${this.collectionName}: ${JSON.stringify(apiQuery)}`);
    return this.collection.countDocuments(apiQuery.query);
  }

  public countByMonthToDate(): Promise<number> {
    const start: number = getTimestampMonthStart();
    const end: number = getTimestamp();
    return this.countForDateRange(start, end);
  }

  public countByDate(date: string): Promise<number> {
    if (!isValidDate(date)) {
      throw new ValidationError(`Invalid date string: ${date}`);
    }
    const start: number = getTimestampDateStart(date);
    const end: number = getTimestampDateEnd(date);
    return this.countForDateRange(start, end);
  }

  public countByDateRange(startDate: string, endDate: string): Promise<number> {
    if (!isValidDate(startDate)) {
      throw new ValidationError(`Invalid date string: ${startDate}`);
    }
    if (!isValidDate(endDate)) {
      throw new ValidationError(`Invalid date string: ${endDate}`);
    }
    const start: number = getTimestampDateStart(startDate);
    const end: number = getTimestampDateEnd(endDate);
    return this.countForDateRange(start, end);
  }

  public countByRollingHours(hours: number): Promise<number> {
    const start: number = getTimestampSubHours(hours);
    const end: number = getTimestamp();
    return this.countForDateRange(start, end);
  }

  public countByRollingDays(days: number): Promise<number> {
    const start: number = getTimestampSubDays(days);
    const end: number = getTimestamp();
    return this.countForDateRange(start, end);
  }

  public countByRollingWeeks(weeks: number): Promise<number> {
    const start: number = getTimestampSubWeeks(weeks);
    const end: number = getTimestamp();
    return this.countForDateRange(start, end);
  }

  public timeSeriesDay(apiQuery: APIQuery): Promise<any> {
    const pipeline = [
      {
        $match: {
          [this.timestampField]: { $lte: getTimestamp() },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: {
                $toDate: {
                  $multiply: [1000, { $toLong: `$${this.timestampField}` }],
                },
              },
            },
          },
          count: {
            $sum: 1.0,
          },
        },
      },
      {
        $project: {
          _id: 0.0,
          date: '$_id',
          count: 1.0,
        },
      },
      {
        $sort: {
          date: -1.0,
        },
      },
    ];
    return this.aggregate(pipeline, apiQuery);
  }

  public timeSeriesMonth(apiQuery: APIQuery): Promise<any> {
    const pipeline = [
      {
        $match: {
          [this.timestampField]: { $lte: getTimestamp() },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m',
              date: {
                $toDate: {
                  $multiply: [1000, { $toLong: `$${this.timestampField}` }],
                },
              },
            },
          },
          count: {
            $sum: 1.0,
          },
        },
      },
      {
        $project: {
          _id: 0.0,
          date: '$_id',
          count: 1.0,
        },
      },
      {
        $sort: {
          date: -1.0,
        },
      },
    ];
    return this.aggregate(pipeline, apiQuery);
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

  private countForDateRange(start: number, end: number): Promise<number> {
    const apiQuery = new APIQuery();
    apiQuery.query = { [this.timestampField]: { $gte: start, $lte: end } };
    return this.countQuery(apiQuery);
  }
}
