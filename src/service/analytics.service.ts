import { inject, injectable } from 'inversify';

import { TYPE, TimeSeriesGroupBy } from '../constant';
import {
  AccountRepository,
  AssetRepository,
  BundleRepository,
  EventRepository
} from '../database/repository';
import { ILogger } from '../interface/logger.inferface';
import { APIQuery } from '../model';
import {
  getTimestamp,
  getTimestampDateEnd,
  getTimestampDateStart,
  getTimestampMonthStart,
  getTimestampSubDays,
  getTimestampSubHours,
  getTimestampSubWeeks,
  isValidDate
} from '../util';

import { ValidationError, NotFoundError } from '../errors';

@injectable()
export class AnalyticsService {
  constructor(
    @inject(TYPE.AccountRepository) private readonly account: AccountRepository,
    @inject(TYPE.AssetRepository) private readonly asset: AssetRepository,
    @inject(TYPE.EventRepository) private readonly event: EventRepository,
    @inject(TYPE.BundleRepository) private readonly bundle: BundleRepository,
    @inject(TYPE.LoggerService) private readonly logger: ILogger
  ) { }

  public count(collection: string): Promise<number> {
    if (!this[collection]) {
      throw new NotFoundError({ reason: 'No such data' });
    }

    this.logger.debug(`count ${this[collection]}`);
    return this[collection].count();
  }

  public countQuery(collection: string, apiQuery: APIQuery): Promise<number> {
    return this[collection].count(apiQuery);
  }

  public countByMonthToDate(collection: string): Promise<number> {
    const start: number = getTimestampMonthStart();
    const end: number = getTimestamp();
    return this.countForDateRange(collection, start, end);
  }

  public countByDate(collection: string, date: string): Promise<number> {
    if (!isValidDate(date)) {
      throw new ValidationError({ reason: `Invalid date string: ${date}` });
    }

    const start: number = getTimestampDateStart(date);
    const end: number = getTimestampDateEnd(date);
    return this.countForDateRange(collection, start, end);
  }

  public countByDateRange(
    collection: string,
    startDate: string,
    endDate: string
  ): Promise<number> {
    if (!isValidDate(startDate)) {
      throw new ValidationError({ reason: `Invalid date string: ${startDate}` });
    }
    if (!isValidDate(endDate)) {
      throw new ValidationError({ reason: `Invalid date string: ${endDate}` });
    }

    const start: number = getTimestampDateStart(startDate);
    const end: number = getTimestampDateEnd(endDate);
    return this.countForDateRange(collection, start, end);
  }

  public countByRollingHours(
    collection: string,
    hours: number
  ): Promise<number> {
    const start: number = getTimestampSubHours(hours);
    const end: number = getTimestamp();
    return this.countForDateRange(collection, start, end);
  }

  public countByRollingDays(collection: string, days: number): Promise<number> {
    const start: number = getTimestampSubDays(days);
    const end: number = getTimestamp();
    return this.countForDateRange(collection, start, end);
  }

  public countByRollingWeeks(
    collection: string,
    weeks: number
  ): Promise<number> {
    const start: number = getTimestampSubWeeks(weeks);
    const end: number = getTimestamp();
    return this.countForDateRange(collection, start, end);
  }

  public countTimeSeries(collection, groupBy, start, end) {
    const apiQuery = new APIQuery();
    apiQuery.query = [
      {
        $match: {
          [this[collection].timestampField]: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: groupBy,
              date: {
                $toDate: {
                  $multiply: [
                    1000,
                    { $toLong: `$${this[collection].timestampField}` },
                  ],
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
    return this[collection].aggregate(apiQuery);
  }

  private countForDateRange(
    collection: string,
    start: number,
    end: number
  ): Promise<number> {
    const apiQuery = new APIQuery();
    apiQuery.query = {
      [this[collection].timestampField]: { $gte: start, $lte: end },
    };
    return this.countQuery(collection, apiQuery);
  }
}
