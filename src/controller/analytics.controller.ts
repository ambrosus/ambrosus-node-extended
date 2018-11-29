import { Request, Response, NextFunction } from 'express';
import { inject } from 'inversify';
import { controller, httpGet, requestParam } from 'inversify-express-utils';

import { MIDDLEWARE, TYPE } from '../constant/types';
import { ILogger } from '../interface/logger.inferface';
import { APIQuery, APIResponse } from '../model';
import { AnalyticsService } from '../service/analytics.service';
import { BaseController } from './base.controller';
import { authorize } from '../middleware/authorize.middleware';

@controller(
  '/analytics',
  MIDDLEWARE.Context,
  authorize()
)
export class AnalyticsController extends BaseController {

  constructor(
    @inject(TYPE.AnalyticsService) private analyticsService: AnalyticsService,
    @inject(TYPE.LoggerService) protected logger: ILogger
  ) {
    super(logger);
  }

  @httpGet('/:collection/count')
  public async getCount(
    @requestParam('collection') collection: string,
    req: Request, res: Response, next: NextFunction
  ): Promise<APIResponse> {
    try {
      const count = await this.analyticsService.count(collection);
      return APIResponse.fromSingleResult({ count });
    } catch (err) {
      next(err);
    }
  }

  @httpGet('/:collection/count/mtd')
  public async getCountByMonthToDate(
    @requestParam('collection') collection: string,
    req: Request, res: Response, next: NextFunction
  ): Promise<APIResponse> {
    try {
      const count = await this.analyticsService.countByMonthToDate(collection);
      return APIResponse.fromSingleResult({ count });
    } catch (err) {
      next(err);
    }
  }

  @httpGet('/:collection/count/date/:date')
  public async getCountByDate(
    @requestParam('collection') collection: string,
    @requestParam('date') date: string,
    req: Request, res: Response, next: NextFunction
  ): Promise<APIResponse> {
    try {
      const count = await this.analyticsService.countByDate(collection, date);
      return APIResponse.fromSingleResult({ count });
    } catch (err) {
      next(err);
    }
  }

  @httpGet('/:collection/count/daterange/:start/:end')
  public async getCountByDateRange(
    @requestParam('collection') collection: string,
    @requestParam('start') start: string,
    @requestParam('end') end: string,
    req: Request, res: Response, next: NextFunction
  ): Promise<APIResponse> {
    try {
      const count = await this.analyticsService.countByDateRange(collection, start, end);
      return APIResponse.fromSingleResult({ count });
    } catch (err) {
      next(err);
    }
  }

  @httpGet('/:collection/count/rolling/hours/:hours')
  public async getCountByRollingHours(
    @requestParam('collection') collection: string,
    @requestParam('hours') hours: number,
    req: Request, res: Response, next: NextFunction
  ): Promise<APIResponse> {
    try {
      const count = await this.analyticsService.countByRollingHours(collection, hours);
      return APIResponse.fromSingleResult({ count });
    } catch (err) {
      next(err);
    }
  }

  @httpGet('/:collection/count/rolling/days/:days')
  public async getCountByRollingDays(
    @requestParam('collection') collection: string,
    @requestParam('days') days: number,
    req: Request, res: Response, next: NextFunction
  ): Promise<APIResponse> {
    try {
      const count = await this.analyticsService.countByRollingDays(collection, days);
      return APIResponse.fromSingleResult({ count });
    } catch (err) {
      next(err);
    }
  }

  @httpGet('/:collection/timeseries/day')
  public async getTimeSeriesDay(
    @requestParam('collection') collection: string,
    req: Request, res: Response, next: NextFunction
  ): Promise<APIResponse> {
    try {
      const count = await this.analyticsService.timeSeriesDay(
        collection,
        APIQuery.fromRequest(req)
      );
      return APIResponse.fromSingleResult({ count });
    } catch (err) {
      next(err);
    }
  }

  @httpGet('/:collection/timeseries/month')
  public async getTimeSeriesMonth(
    @requestParam('collection') collection: string,
    req: Request, res: Response, next: NextFunction
  ): Promise<APIResponse> {
    try {
      const count = await this.analyticsService.timeSeriesMonth(
        collection,
        APIQuery.fromRequest(req)
      );
      return APIResponse.fromSingleResult({ count });
    } catch (err) {
      next(err);
    }
  }
}
