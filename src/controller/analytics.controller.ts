import { inject } from 'inversify';
import { BaseHttpController, controller, httpGet, requestParam } from 'inversify-express-utils';

import { TYPES } from '../constant/types';
import {
  AccountRepository,
  AssetRepository,
  BundleRepository,
  EventRepository,
} from '../database/repository';

@controller('/analytics', TYPES.AuthorizedMiddleware)
export class AnalyticsController extends BaseHttpController {
  @inject(TYPES.AccountRepository)
  public account: AccountRepository;

  @inject(TYPES.AccountRepository)
  public asset: AssetRepository;

  @inject(TYPES.AccountRepository)
  public event: EventRepository;

  @inject(TYPES.AccountRepository)
  public bundle: BundleRepository;

  constructor() {
    super();
  }

  @httpGet('/:collection/count')
  public async getCount(@requestParam('collection') collection: string) {
    if (!this[collection]) {
      return this.badRequest('Invalid path');
    }
    const count = await this[collection].count();
    return { count };
  }

  @httpGet('/:collection/count/mtd')
  public async getCountByMonthToDate(@requestParam('collection') collection: string) {
    if (!this[collection]) {
      return this.badRequest('Invalid path');
    }
    const count = await this[collection].getCountByMonthToDate();
    return { count };
  }

  @httpGet('/:collection/count/date/:date')
  public async getCountByDate(
    @requestParam('collection') collection: string,
    @requestParam('date') date: string
  ) {
    if (!this[collection]) {
      return this.badRequest('Invalid path');
    }
    const count = await this[collection].getCountByDate(date);
    return { count };
  }

  @httpGet('/:collection/count/daterange/:start/:end')
  public async getCountByDateRange(
    @requestParam('collection') collection: string,
    @requestParam('start') start: string,
    @requestParam('end') end: string
  ) {
    if (!this[collection]) {
      return this.badRequest('Invalid path');
    }
    const count = await this[collection].getCountByDateRange(start, end);
    return { count };
  }

  @httpGet('/:collection/count/rolling/hours/:hours')
  public async getCountByRollingHours(
    @requestParam('collection') collection: string,
    @requestParam('hours') hours: number
  ) {
    if (!this[collection]) {
      return this.badRequest('Invalid path');
    }
    const count = await this[collection].getCountByRollingHours(hours);
    return { count };
  }

  @httpGet('/:collection/count/rolling/days/:days')
  public async getCountByRollingDays(
    @requestParam('collection') collection: string,
    @requestParam('days') days: number
  ) {
    if (!this[collection]) {
      return this.badRequest('Invalid path');
    }
    const count = await this[collection].getCountByRollingDays(days);
    return { count };
  }
}
