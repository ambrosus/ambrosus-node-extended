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
import { controller, httpGet, httpPost, requestParam } from 'inversify-express-utils';

import { MIDDLEWARE, TYPE } from '../constant/types';
import { ILogger } from '../interface/logger.inferface';
import { APIQuery, APIResponse } from '../model';
import { AssetService } from '../service/asset.service';
import { BaseController } from './base.controller';
import { validate } from '../middleware';
import { querySchema } from '../validation';

@controller(
  '/asset',
  MIDDLEWARE.Context
)
export class AssetController extends BaseController {

  constructor(
    @inject(TYPE.AssetService) private assetService: AssetService,
    @inject(TYPE.LoggerService) protected logger: ILogger
  ) {
    super(logger);
  }

  @httpGet(
    '/'
  )
  public async getAssets(req: Request): Promise<APIResponse> {
    const result = await this.assetService.getAssets(APIQuery.fromRequest(req));
    return APIResponse.fromMongoPagedResult(result);
  }

  @httpGet(
    '/:assetId'
  )
  public async get(
    @requestParam('assetId') assetId: string
  ): Promise<APIResponse> {
    const result = await this.assetService.getAsset(assetId);
    return APIResponse.fromSingleResult(result);
  }

  @httpGet(
    '/exists/:assetId'
  )
  public async getAssetExists(
    @requestParam('assetId') assetId: string
  ): Promise<APIResponse> {
    const result = await this.assetService.getAssetExists(assetId);
    return APIResponse.fromSingleResult(result);
  }

  @httpPost(
    '/query',
    validate(querySchema)
  )
  public async query(req: Request): Promise<APIResponse> {
    const result = await this.assetService.getAssets(APIQuery.fromRequest(req));
    return APIResponse.fromMongoPagedResult(result);
  }
}
