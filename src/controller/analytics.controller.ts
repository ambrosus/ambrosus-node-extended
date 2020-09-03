/*
 * Copyright: Ambrosus Inc.
 * Email: tech@ambrosus.io
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files
 * (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import { inject } from 'inversify';
import {
  controller,
  httpGet,
  queryParam,
  requestParam
} from 'inversify-express-utils';
import { Request } from 'express';
import { MIDDLEWARE, timeSeriesGroupFromString, TYPE } from '../constant';
import { ILogger } from '../interface/logger.inferface';
import { authorize } from '../middleware/authorize.middleware';
import { APIResponse } from '../model';
import { AnalyticsService } from '../service/analytics.service';
import { BaseController } from './base.controller';
import { parseAnalytics } from '../util';
import { validate } from '../middleware';
import { utilSchema } from '../validation';

@controller('/analytics', MIDDLEWARE.Context, authorize())
export class AnalyticsController extends BaseController {

  constructor(
    @inject(TYPE.AnalyticsService) private analyticsService: AnalyticsService,
    @inject(TYPE.LoggerService) protected logger: ILogger
  ) {
    super(logger);
  }

  @httpGet(
    '/:organizationId/:collection/count',
    validate(utilSchema.collection, { paramsOnly: true })
  )
  public async getCountForOrganization(
    @requestParam('organizationId') organizationId: number,
    @requestParam('collection') collection: string
  ): Promise<APIResponse> {
    const _collection = collection === 'bundle' ? 'bundle_metadata' : collection;
    const count = await this.analyticsService.countLimitedByOrganization(
      +organizationId,
      _collection
    );
    return APIResponse.fromSingleResult({ count });
  }

  @httpGet(
    '/:organizationId/:collection/count/:start/:end/total',
    validate(utilSchema.collection, { paramsOnly: true })
  )
  public async getTimeRangeCountForOrganization(
    req: Request
  ): Promise<APIResponse> {
    const { organizationId, collection, start, end } = req.params;
    const _collection = collection === 'bundle' ? 'bundle_metadata' : collection;

    const count = await this.analyticsService.countForTimeRangeLimitedByOrganization(
      +organizationId,
      _collection,
      +start,
      +end
    );
    return APIResponse.fromSingleResult({ count });
  }

  @httpGet(
    '/:organizationId/:collection/count/:start/:end/aggregate/:group',
    validate(utilSchema.collection, { paramsOnly: true })
  )
  public async getTimeRangeCountAggregateForOrganization(
    req: Request
  ): Promise<APIResponse> {
    const { organizationId, collection, start, end, group } = req.params;
    const _collection = collection === 'bundle' ? 'bundle_metadata' : collection;

    const groupBy = timeSeriesGroupFromString(group);

    let count = await this.analyticsService.countForTimeRangeWithAggregateLimitedByOrganization(
      +organizationId,
      _collection,
      groupBy,
      +start,
      +end
    );

    count = parseAnalytics(count, start, end, group);

    return APIResponse.fromSingleResult({ count });
  }

  @httpGet(
    '/:collection/count',
    authorize('super_account'),
    validate(utilSchema.collection, { paramsOnly: true })
  )
  public async getCount(
    @requestParam('collection') collection: string
  ): Promise<APIResponse> {
    const _collection = collection === 'bundle' ? 'bundle_metadata' : collection;
    const count = await this.analyticsService.count(_collection);
    return APIResponse.fromSingleResult({ count });
  }

  @httpGet(
    '/:collection/count/:start/:end/total',
    authorize('super_account'),
    validate(utilSchema.collection, { paramsOnly: true })
  )
  public async getTimeRangeCount(req: Request): Promise<APIResponse> {
    const { collection, start, end } = req.params;
    const _collection = collection === 'bundle' ? 'bundle_metadata' : collection;

    const count = await this.analyticsService.countForTimeRange(
      _collection,
      +start,
      +end
    );
    return APIResponse.fromSingleResult({ count });
  }

  @httpGet(
    '/:collection/count/:start/:end/aggregate/:group',
    authorize('super_account'),
    validate(utilSchema.collection, { paramsOnly: true })
  )
  public async getTimeRangeCountAggregate(req: Request): Promise<APIResponse> {
    const { collection, start, end, group } = req.params;
    const _collection = collection === 'bundle' ? 'bundle_metadata' : collection;

    const groupBy = timeSeriesGroupFromString(group);

    let count = await this.analyticsService.countForTimeRangeWithAggregate(
      _collection,
      groupBy,
      +start,
      +end
    );

    count = parseAnalytics(count, start, end, group);

    return APIResponse.fromSingleResult({ count });
  }
}
