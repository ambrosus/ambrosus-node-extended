import { Request } from 'express';
import { inject } from 'inversify';
import { controller, httpGet, requestParam } from 'inversify-express-utils';

import { MIDDLEWARE, TYPE } from '../constant/types';
import { APIQuery, APIResponse } from '../model';
import { AnalyticsService } from '../service/analytics.service';
import { BaseController } from './base.controller';

@controller('/analytics', MIDDLEWARE.Authorized)
export class AnalyticsController extends BaseController {
  constructor(@inject(TYPE.AnalyticsService) private analyticsService: AnalyticsService) {
    super();
  }

  @httpGet('/:collection/count')
  public async getCount(@requestParam('collection') collection: string): Promise<APIResponse> {
    try {
      const count = await this.analyticsService.count(collection);
      const apiResponse = APIResponse.fromSingleResult({ count });
      apiResponse.meta['collection'] = collection;
      return apiResponse;
    } catch (err) {
      return super.handleError(err);
    }
  }

  @httpGet('/:collection/count/mtd')
  public async getCountByMonthToDate(
    @requestParam('collection') collection: string
  ): Promise<APIResponse> {
    try {
      const count = await this.analyticsService.countByMonthToDate(collection);
      const apiResponse = APIResponse.fromSingleResult({ count });
      apiResponse.meta['collection'] = collection;
      return apiResponse;
    } catch (err) {
      return super.handleError(err);
    }
  }

  @httpGet('/:collection/count/date/:date')
  public async getCountByDate(
    @requestParam('collection') collection: string,
    @requestParam('date') date: string
  ): Promise<APIResponse> {
    try {
      const count = await this.analyticsService.countByDate(collection, date);
      const apiResponse = APIResponse.fromSingleResult({ count });
      apiResponse.meta['collection'] = collection;
      return apiResponse;
    } catch (err) {
      return super.handleError(err);
    }
  }

  @httpGet('/:collection/count/daterange/:start/:end')
  public async getCountByDateRange(
    @requestParam('collection') collection: string,
    @requestParam('start') start: string,
    @requestParam('end') end: string
  ): Promise<APIResponse> {
    try {
      const count = await this.analyticsService.countByDateRange(collection, start, end);
      const apiResponse = APIResponse.fromSingleResult({ count });
      apiResponse.meta['collection'] = collection;
      return apiResponse;
    } catch (err) {
      return super.handleError(err);
    }
  }

  @httpGet('/:collection/count/rolling/hours/:hours')
  public async getCountByRollingHours(
    @requestParam('collection') collection: string,
    @requestParam('hours') hours: number
  ): Promise<APIResponse> {
    try {
      const count = await this.analyticsService.countByRollingHours(collection, hours);
      const apiResponse = APIResponse.fromSingleResult({ count });
      apiResponse.meta['collection'] = collection;
      return apiResponse;
    } catch (err) {
      return super.handleError(err);
    }
  }

  @httpGet('/:collection/count/rolling/days/:days')
  public async getCountByRollingDays(
    @requestParam('collection') collection: string,
    @requestParam('days') days: number
  ): Promise<APIResponse> {
    try {
      const count = await this.analyticsService.countByRollingDays(collection, days);
      const apiResponse = APIResponse.fromSingleResult({ count });
      apiResponse.meta['collection'] = collection;
      return apiResponse;
    } catch (err) {
      return super.handleError(err);
    }
  }

  @httpGet('/:collection/timeseries/day')
  public async getTimeSeriesDay(
    @requestParam('collection') collection: string,
    req: Request
  ): Promise<APIResponse> {
    try {
      const count = await this.analyticsService.timeSeriesDay(
        collection,
        APIQuery.fromRequest(req)
      );
      const apiResponse = APIResponse.fromSingleResult({ count });
      apiResponse.meta['collection'] = collection;
      return apiResponse;
    } catch (err) {
      return super.handleError(err);
    }
  }

  @httpGet('/:collection/timeseries/month')
  public async getTimeSeriesMonth(
    @requestParam('collection') collection: string,
    req: Request
  ): Promise<APIResponse> {
    try {
      const count = await this.analyticsService.timeSeriesMonth(
        collection,
        APIQuery.fromRequest(req)
      );
      const apiResponse = APIResponse.fromSingleResult({ count });
      apiResponse.meta['collection'] = collection;
      return apiResponse;
    } catch (err) {
      return super.handleError(err);
    }
  }
}
