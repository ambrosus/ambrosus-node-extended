import { Request } from 'express';
import { inject } from 'inversify';
import {
  controller,
  httpGet,
  requestParam,
  queryParam
} from 'inversify-express-utils';

import { MIDDLEWARE, TYPE, TimeSeriesGroupBy, timeSeriesGroupFromString } from '../constant';
import { ILogger } from '../interface/logger.inferface';
import { APIQuery, APIResponse } from '../model';
import { AnalyticsService } from '../service/analytics.service';
import { BaseController } from './base.controller';
import { query } from 'winston';

@controller('/analytics', MIDDLEWARE.Authorized)
export class AnalyticsController extends BaseController {
  constructor(
    @inject(TYPE.AnalyticsService) private analyticsService: AnalyticsService,
    @inject(TYPE.LoggerService) protected logger: ILogger
  ) {
    super(logger);
  }

  @httpGet('/:collection/count')
  public async getCount(
    @requestParam('collection') collection: string
  ): Promise<APIResponse> {
    try {
      const count = await this.analyticsService.count(collection);
      return APIResponse.fromSingleResult({ count });
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
      return APIResponse.fromSingleResult({ count });
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
      return APIResponse.fromSingleResult({ count });
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
      const count = await this.analyticsService.countByDateRange(
        collection,
        start,
        end
      );
      return APIResponse.fromSingleResult({ count });
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
      const count = await this.analyticsService.countByRollingHours(
        collection,
        hours
      );
      return APIResponse.fromSingleResult({ count });
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
      const count = await this.analyticsService.countByRollingDays(
        collection,
        days
      );
      return APIResponse.fromSingleResult({ count });
    } catch (err) {
      return super.handleError(err);
    }
  }

  @httpGet('/:collection/timeseries/hour/:start/:end/')
  public async getTimeSeriesHour(
    @requestParam('collection') collection: string,
    @requestParam('start') start: string,
    @requestParam('end') end: string
  ): Promise<APIResponse> {
    try {
      const count = await this.analyticsService.countTimeSeries(
        collection,
        TimeSeriesGroupBy.HOUR,
        start,
        end
      );
      return APIResponse.fromSingleResult({ count });
    } catch (err) {
      return super.handleError(err);
    }
  }

  @httpGet('/:collection/count/timeseries')
  public async getTimeSeries(
    @requestParam('collection') collection: string,
    @queryParam('group') group: string,
    @queryParam('start') start: string,
    @queryParam('end') end: string
  ): Promise<APIResponse> {
    try {
      const groupBy = timeSeriesGroupFromString(group);

      const count = await this.analyticsService.countTimeSeries(
        collection,
        groupBy,
        +start,
        +end
      );
      return APIResponse.fromSingleResult({ count });
    } catch (err) {
      return super.handleError(err);
    }
  }
}
