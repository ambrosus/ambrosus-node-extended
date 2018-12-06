import { inject } from 'inversify';
import {
  controller,
  httpGet,
  queryParam,
  requestParam
} from 'inversify-express-utils';

import { MIDDLEWARE, timeSeriesGroupFromString, TYPE } from '../constant';
import { ILogger } from '../interface/logger.inferface';
import { authorize } from '../middleware/authorize.middleware';
import { APIResponse } from '../model';
import { AnalyticsService } from '../service/analytics.service';
import { BaseController } from './base.controller';
import { parseAnalytics } from '../util';

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

  @httpGet('/:collection/count/:start/:end/total')
  public async getTimeRangeCount(
    @requestParam('collection') collection: string,
    @requestParam('start') start: number,
    @requestParam('end') end: number
  ): Promise<APIResponse> {
    const count = await this.analyticsService.countForTimeRange(
      collection,
      +start,
      +end
    );
    return APIResponse.fromSingleResult({ count });
  }

  @httpGet('/:collection/count/:start/:end/aggregate')
  public async getTimeRangeCountAggregate(
    @requestParam('collection') collection: string,
    @queryParam('group') group: string,
    @requestParam('start') start: number,
    @requestParam('end') end: number
  ): Promise<APIResponse> {
    const groupBy = timeSeriesGroupFromString(group);

    let count = await this.analyticsService.countForTimeRangeWithAggregate(
      collection,
      groupBy,
      +start,
      +end
    );

    count = parseAnalytics(count, start, end, group);

    return APIResponse.fromSingleResult({ count });
  }
}
