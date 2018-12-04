import { Request } from 'express';
import { inject } from 'inversify';
import {
  controller,
  httpGet,
  requestParam,
  queryParam
} from 'inversify-express-utils';

import {
  MIDDLEWARE,
  TYPE,
  TimeSeriesGroupBy,
  timeSeriesGroupFromString
} from '../constant';
import { ILogger } from '../interface/logger.inferface';
import { APIQuery, APIResponse } from '../model';
import { AnalyticsService } from '../service/analytics.service';
import { BaseController } from './base.controller';
import { authorize } from '../middleware/authorize.middleware';

@controller('/analytics', MIDDLEWARE.Context, authorize())
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
    const count = await this.analyticsService.count(collection);
    return APIResponse.fromSingleResult({ count });
  }

  @httpGet('/:collection/count/timerange/total')
  public async getTimeRangeCount(
    @requestParam('collection') collection: string,
    @queryParam('start') start: string,
    @queryParam('end') end: string
  ): Promise<APIResponse> {
    const count = await this.analyticsService.countForTimeRange(
      collection,
      +start,
      +end
    );
    return APIResponse.fromSingleResult({ count });
  }

  @httpGet('/:collection/count/timerange/aggregate')
  public async getTimeRangeCountAggregate(
    @requestParam('collection') collection: string,
    @queryParam('group') group: string,
    @queryParam('start') start: string,
    @queryParam('end') end: string
  ): Promise<APIResponse> {
    const groupBy = timeSeriesGroupFromString(group);

    const count = await this.analyticsService.countForTimeRangeWithAggregate(
      collection,
      groupBy,
      +start,
      +end
    );
    return APIResponse.fromSingleResult({ count });
  }
}
