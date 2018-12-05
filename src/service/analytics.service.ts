import { inject, injectable } from 'inversify';

import { TYPE } from '../constant';
import {
  AccountRepository,
  AssetRepository,
  BundleRepository,
  EventRepository
} from '../database/repository';
import { NotFoundError } from '../errors';
import { ILogger } from '../interface/logger.inferface';
import { APIQuery } from '../model';

@injectable()
export class AnalyticsService {
  constructor(
    @inject(TYPE.AccountRepository) private readonly account: AccountRepository,
    @inject(TYPE.AssetRepository) private readonly asset: AssetRepository,
    @inject(TYPE.EventRepository) private readonly event: EventRepository,
    @inject(TYPE.BundleRepository) private readonly bundle: BundleRepository,
    @inject(TYPE.LoggerService) private readonly logger: ILogger
  ) {}

  public count(collection: string): Promise<number> {
    if (!this[collection]) {
      throw new NotFoundError({ reason: 'No such data' });
    }
    return this[collection].count(new APIQuery());
  }

  public countForTimeRangeWithAggregate(collection, groupBy, start, end) {
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

  public countForTimeRange(
    collection: string,
    start: number,
    end: number
  ): Promise<number> {
    const apiQuery = new APIQuery();
    apiQuery.query = {
      [this[collection].timestampField]: { $gte: start, $lte: end },
    };
    return this[collection].count(apiQuery);
  }
}
