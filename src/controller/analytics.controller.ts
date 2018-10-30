import { Request } from 'express';
import { inject } from 'inversify';
import { BaseHttpController, controller, httpGet, requestParam } from 'inversify-express-utils';

import { TYPE, MIDDLEWARE } from '../constant/types';
import { APIQuery } from '../model';
import { AnalyticsService } from '../service/analytics.service';

@controller('/analytics', MIDDLEWARE.Authorized)
export class AnalyticsController extends BaseHttpController {
  constructor(@inject(TYPE.AnalyticsService) private analyticsService: AnalyticsService) {
    super();
  }

  @httpGet('/:collection/count')
  public async getCount(@requestParam('collection') collection: string) {
    const count = await this.analyticsService.count(collection);
    return { count };
  }

  @httpGet('/:collection/count/mtd')
  public async getCountByMonthToDate(@requestParam('collection') collection: string) {
    const count = await this.analyticsService.countByMonthToDate(collection);
    return { count };
  }

  @httpGet('/:collection/count/date/:date')
  public async getCountByDate(
    @requestParam('collection') collection: string,
    @requestParam('date') date: string
  ) {
    const count = await this.analyticsService.countByDate(collection, date);
    return { count };
  }

  @httpGet('/:collection/count/daterange/:start/:end')
  public async getCountByDateRange(
    @requestParam('collection') collection: string,
    @requestParam('start') start: string,
    @requestParam('end') end: string
  ) {
    const count = await this.analyticsService.countByDateRange(collection, start, end);
    return { count };
  }

  @httpGet('/:collection/count/rolling/hours/:hours')
  public async getCountByRollingHours(
    @requestParam('collection') collection: string,
    @requestParam('hours') hours: number
  ) {
    const count = await this.analyticsService.countByRollingHours(collection, hours);
    return { count };
  }

  @httpGet('/:collection/count/rolling/days/:days')
  public async getCountByRollingDays(
    @requestParam('collection') collection: string,
    @requestParam('days') days: number
  ) {
    const count = await this.analyticsService.countByRollingDays(collection, days);
    return { count };
  }

  @httpGet('/:collection/timeseries/day')
  public async getTimeSeriesDay(@requestParam('collection') collection: string, req: Request) {
    const result = await this.analyticsService.timeSeriesDay(collection, APIQuery.fromRequest(req));
    return result;
  }

  @httpGet('/:collection/timeseries/month')
  public async getTimeSeriesMonth(@requestParam('collection') collection: string, req: Request) {
    const result = await this.analyticsService.timeSeriesMonth(
      collection,
      APIQuery.fromRequest(req)
    );
    return result;
  }
}
