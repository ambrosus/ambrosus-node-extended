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

import { Request } from 'express';
import { inject } from 'inversify';
import {
  controller,
  httpGet,
  httpPost,
  requestParam
} from 'inversify-express-utils';

import { MIDDLEWARE, TYPE } from '../constant/types';
import { ILogger } from '../interface/logger.inferface';
import { validate } from '../middleware';
import { authorize } from '../middleware/authorize.middleware';
import { APIQuery, APIResponse, MongoPagedResult } from '../model';
import { BundleService } from '../service/bundle.service';
import { querySchema } from '../validation';
import { BaseController } from './base.controller';

@controller(
  '/bundle2',
  MIDDLEWARE.Context,
  authorize()
)

export class Bundle2Controller extends BaseController {
  constructor(
    @inject(TYPE.BundleService) private bundleService: BundleService,
    @inject(TYPE.LoggerService) protected logger: ILogger
  ) {
    super(logger);
  }

  @httpGet('/list')
  public async getBundles(req: Request): Promise<APIResponse> {
    const result = await this.bundleService.getBundles(
      APIQuery.fromRequest(req)
    );
    return APIResponse.fromMongoPagedResult(result);
  }

  @httpGet('/info/:bundleId')
  public async getBundle(
    @requestParam('bundleId') bundleId: string
  ): Promise<APIResponse> {
    const result = await this.bundleService.getBundle(bundleId);
    return APIResponse.fromSingleResult(result);
  }

  @httpGet('/exists/:bundleId')
  public async getBundleExists(
    @requestParam('bundleId') bundleId: string
  ): Promise<APIResponse> {
    const result = await this.bundleService.getBundleExists(bundleId);
    return APIResponse.fromSingleResult(result);
  }

  @httpPost('/query', validate(querySchema))
  public async queryBundles(req: Request): Promise<APIResponse> {
    const result = await this.bundleService.getBundles(
      APIQuery.fromRequest(req)
    );
    return APIResponse.fromMongoPagedResult(result);
  }

  @httpPost(
    '/push',
    authorize('super_account'),
    validate(querySchema)
  )
  public async pushBundles(req: Request): Promise<APIResponse> {
    await this.bundleService.pushBundle();

    const result = new MongoPagedResult;

    return APIResponse.fromMongoPagedResult(result);
  }
}
