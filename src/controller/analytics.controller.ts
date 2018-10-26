import { inject } from 'inversify';
import { BaseHttpController, controller, httpGet, requestParam } from 'inversify-express-utils';
import { Request } from 'express';
import { TYPES } from '../constant/types';
import {
  AccountRepository,
  AssetRepository,
  BundleRepository,
  EventRepository,
} from '../database/repository';

import { APIQuery } from '../model';

@controller('/analytics', TYPES.AuthorizedMiddleware)
export class AnalyticsController extends BaseHttpController {
  @inject(TYPES.AccountRepository)
  public account: AccountRepository;

  @inject(TYPES.AssetRepository)
  public asset: AssetRepository;

  @inject(TYPES.EventRepository)
  public event: EventRepository;

  @inject(TYPES.BundleRepository)
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
    const count = await this[collection].countByMonthToDate();
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
    const count = await this[collection].countByDate(date);
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
    const count = await this[collection].countByDateRange(start, end);
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
    const count = await this[collection].countByRollingHours(hours);
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
    const count = await this[collection].countByRollingDays(days);
    return { count };
  }

  @httpGet('/:collection/timeseries/day')
  public async getTimeSeriesDay(@requestParam('collection') collection: string, req: Request) {
    if (!this[collection]) {
      return this.badRequest('Invalid path');
    }
    const result = await this[collection].timeSeriesDay(APIQuery.fromRequest(req));
    return result;
  }

  @httpGet('/:collection/timeseries/month')
  public async getTimeSeriesMonth(@requestParam('collection') collection: string, req: Request) {
    if (!this[collection]) {
      return this.badRequest('Invalid path');
    }
    const result = await this[collection].timeSeriesMonth(APIQuery.fromRequest(req));
    return result;
  }
}
