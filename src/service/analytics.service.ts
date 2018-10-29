import { inject, injectable } from 'inversify';

import { TYPES } from '../constant/types';
import {
  AccountRepository,
  AssetRepository,
  BundleRepository,
  EventRepository,
} from '../database/repository';
import { NotFoundError, ValidationError } from '../error';
import { ILogger } from '../interface/logger.inferface';
import { APIQuery, APIResult } from '../model';
import {
  getTimestamp,
  getTimestampDateEnd,
  getTimestampDateStart,
  getTimestampMonthStart,
  getTimestampSubDays,
  getTimestampSubHours,
  getTimestampSubWeeks,
  isValidDate,
} from '../util/helpers';

@injectable()
export class AnalyticsService {
  constructor(
    @inject(TYPES.AccountRepository) private readonly account: AccountRepository,
    @inject(TYPES.AssetRepository) private readonly asset: AssetRepository,
    @inject(TYPES.EventRepository) private readonly event: EventRepository,
    @inject(TYPES.BundleRepository) private readonly bundle: BundleRepository,
    @inject(TYPES.LoggerService) private readonly logger: ILogger
  ) {}

  public count(collection: string): Promise<number> {
    if (!this[collection]) {
      throw new NotFoundError('Bad Request');
    }
    this.logger.debug(`count ${this[collection]}`);
    return this[collection].count();
  }

  public countQuery(collection: string, apiQuery: APIQuery): Promise<number> {
    this.logger.debug(`countQuery ${this[collection]}: ${JSON.stringify(apiQuery)}`);
    return this[collection].count(apiQuery.query);
  }

  public countByMonthToDate(collection: string): Promise<number> {
    const start: number = getTimestampMonthStart();
    const end: number = getTimestamp();
    return this.countForDateRange(collection, start, end);
  }

  public countByDate(collection: string, date: string): Promise<number> {
    if (!isValidDate(date)) {
      throw new ValidationError(`Invalid date string: ${date}`);
    }
    const start: number = getTimestampDateStart(date);
    const end: number = getTimestampDateEnd(date);
    return this.countForDateRange(collection, start, end);
  }

  public countByDateRange(collection: string, startDate: string, endDate: string): Promise<number> {
    if (!isValidDate(startDate)) {
      throw new ValidationError(`Invalid date string: ${startDate}`);
    }
    if (!isValidDate(endDate)) {
      throw new ValidationError(`Invalid date string: ${endDate}`);
    }
    const start: number = getTimestampDateStart(startDate);
    const end: number = getTimestampDateEnd(endDate);
    return this.countForDateRange(collection, start, end);
  }

  public countByRollingHours(collection: string, hours: number): Promise<number> {
    const start: number = getTimestampSubHours(hours);
    const end: number = getTimestamp();
    return this.countForDateRange(collection, start, end);
  }

  public countByRollingDays(collection: string, days: number): Promise<number> {
    const start: number = getTimestampSubDays(days);
    const end: number = getTimestamp();
    return this.countForDateRange(collection, start, end);
  }

  public countByRollingWeeks(collection: string, weeks: number): Promise<number> {
    const start: number = getTimestampSubWeeks(weeks);
    const end: number = getTimestamp();
    return this.countForDateRange(collection, start, end);
  }

  public timeSeriesDay(collection, apiQuery: APIQuery): Promise<any> {
    const pipeline = [
      {
        $match: {
          [this[collection].timestampField]: { $lte: getTimestamp() },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: {
                $toDate: {
                  $multiply: [1000, { $toLong: `$${this[collection].timestampField}` }],
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
    return this[collection].aggregate(pipeline, apiQuery);
  }

  public timeSeriesMonth(collection, apiQuery: APIQuery): Promise<any> {
    const pipeline = [
      {
        $match: {
          [this[collection].timestampField]: { $lte: getTimestamp() },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m',
              date: {
                $toDate: {
                  $multiply: [1000, { $toLong: `$${this[collection].timestampField}` }],
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
    return this[collection].aggregate(pipeline, apiQuery);
  }

  private countForDateRange(collection: string, start: number, end: number): Promise<number> {
    const apiQuery = new APIQuery();
    apiQuery.query = { [this[collection].timestampField]: { $gte: start, $lte: end } };
    return this.countQuery(collection, apiQuery);
  }
}
