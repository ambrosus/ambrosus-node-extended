import { inject, injectable, unmanaged } from 'inversify';

import { TYPES } from '../constant';
import {
  getTimestamp,
  getTimestampSubDays,
  getTimestampSubHours,
  getTimestampSubWeeks,
  getTimestampMonthStart,
  getTimestampDateStart,
  getTimestampDateEnd,
  isValidDate
} from '../util/helpers';
import { ValidationError } from '../error';

import { MongoDBClient } from '../util/mongodb/client';
import { APIQuery } from '../model';

@injectable()
export class AnalyticsService {
  protected collection: string;
  constructor(
    @inject(TYPES.MongoDBClient) protected db: MongoDBClient,
    @unmanaged() collection: string
  ) {
    this.collection = collection;
  }

  public async getCountTotal(): Promise<any> {
    const apiQuery = new APIQuery();
    apiQuery.collection = this.collection;
    return new Promise<any>((resolve, reject) => {
      this.db.count(apiQuery, (error, count: number) => {
        if (error) {
          reject(error);
        }
        resolve({ count });
      });
    });
  }

  public async getCountByMonthToDate(): Promise<any> {
    const start: number = getTimestampMonthStart();
    const end: number = getTimestamp();
    return this.getCountForDateRange(start, end);
  }

  public async getCountByDate(date: string): Promise<any> {
    if (!isValidDate(date)) {
      throw new ValidationError(`Invalid date string: ${date}`);
    }
    const start: number = getTimestampDateStart(date);
    const end: number = getTimestampDateEnd(date);
    return this.getCountForDateRange(start, end);
  }

  public async getCountByDateRange(startDate: string, endDate: string): Promise<any> {
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

  public async getCountByRollingHours(hours: number): Promise<any> {
    const start: number = getTimestampSubHours(hours);
    const end: number = getTimestamp();
    return this.getCountForDateRange(start, end);
  }

  public async getCountByRollingDays(days: number): Promise<any> {
    const start: number = getTimestampSubDays(days);
    const end: number = getTimestamp();
    return this.getCountForDateRange(start, end);
  }

  public async getCountByRollingWeeks(weeks: number): Promise<any> {
    const start: number = getTimestampSubWeeks(weeks);
    const end: number = getTimestamp();
    return this.getCountForDateRange(start, end);
  }

  private async getCountForDateRange(start: number, end: number) {
    const apiQuery = new APIQuery();
    apiQuery.collection = this.collection;
    apiQuery.query = { 'content.idData.timestamp': { $gte: start, $lte: end } };
    return new Promise<any>((resolve, reject) => {
      this.db.count(apiQuery, (error, count: number) => {
        if (error) {
          reject(error);
        }
        resolve({ count });
      });
    });
  }
}
