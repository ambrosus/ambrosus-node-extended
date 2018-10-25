import { inject, injectable, unmanaged } from 'inversify';
import * as MongoPaging from 'mongo-cursor-pagination';

import { TYPES } from '../../constant';
import { ConnectionError, ValidationError } from '../../error';
import { ILogger } from '../../interface/logger.inferface';
import { APIQuery, APIResult } from '../../model';
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
    @unmanaged() private collectionName: string
  ) {}

  get collection(): any {
    if (!this.client) {
      throw new ConnectionError('Database client not initialized');
    }
    return this.client.db.collection(this.collectionName);
  }

  public create(item: T): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
  public update(id: string, item: T): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
  public delete(id: string): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  public find(apiQuery: APIQuery): Promise<APIResult> {
    this.logger.debug(`find ${this.collectionName}: ${JSON.stringify(apiQuery)}`);
    return MongoPaging.find(this.collection, {
      query: apiQuery.query,
      fields: { projection: apiQuery.fields },
      paginatedField: apiQuery.paginationField,
      sortAscending: apiQuery.sortAscending,
      limit: apiQuery.limit,
      next: apiQuery.next,
      previous: apiQuery.previous,
    });
  }

  public findOne(apiQuery: APIQuery): Promise<T> {
    this.logger.debug(`findOne ${this.collectionName}: ${JSON.stringify(apiQuery)}`);
    return this.collection.findOne(apiQuery.query, apiQuery.options);
  }

  public aggregate(pipeline: object, apiQuery: APIQuery): Promise<APIResult> {
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

  public count(): Promise<number> {
    this.logger.debug(`count ${this.collectionName}`);
    return this.collection.countDocuments();
  }

  public countQuery(apiQuery: APIQuery): Promise<number> {
    this.logger.debug(`countQuery ${this.collectionName}: ${JSON.stringify(apiQuery)}`);
    return this.collection.countDocuments(apiQuery.query);
  }

  public getCountByMonthToDate(): Promise<number> {
    const start: number = getTimestampMonthStart();
    const end: number = getTimestamp();
    return this.getCountForDateRange(start, end);
  }

  public getCountByDate(date: string): Promise<number> {
    if (!isValidDate(date)) {
      throw new ValidationError(`Invalid date string: ${date}`);
    }
    const start: number = getTimestampDateStart(date);
    const end: number = getTimestampDateEnd(date);
    return this.getCountForDateRange(start, end);
  }

  public getCountByDateRange(startDate: string, endDate: string): Promise<number> {
    if (!isValidDate(startDate)) {
      throw new ValidationError(`Invalid date string: ${startDate}`);
    }
    if (!isValidDate(endDate)) {
      throw new ValidationError(`Invalid date string: ${endDate}`);
    }
    const start: number = getTimestampDateStart(startDate);
    const end: number = getTimestampDateEnd(endDate);
    return this.getCountForDateRange(start, end);
  }

  public getCountByRollingHours(hours: number): Promise<number> {
    const start: number = getTimestampSubHours(hours);
    const end: number = getTimestamp();
    return this.getCountForDateRange(start, end);
  }

  public getCountByRollingDays(days: number): Promise<number> {
    const start: number = getTimestampSubDays(days);
    const end: number = getTimestamp();
    return this.getCountForDateRange(start, end);
  }

  public getCountByRollingWeeks(weeks: number): Promise<number> {
    const start: number = getTimestampSubWeeks(weeks);
    const end: number = getTimestamp();
    return this.getCountForDateRange(start, end);
  }

  private getCountForDateRange(start: number, end: number): Promise<number> {
    const apiQuery = new APIQuery();
    apiQuery.query = { 'content.idData.timestamp': { $gte: start, $lte: end } };
    return this.countQuery(apiQuery);
  }
}
