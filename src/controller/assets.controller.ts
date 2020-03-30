/*
 * Copyright: Ambrosus Inc.
 * Email: tech@ambrosus.com
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
import { controller, httpGet, requestParam } from 'inversify-express-utils';

import { MIDDLEWARE, TYPE } from '../constant/types';
import { ILogger } from '../interface/logger.inferface';
import { APIQuery, APIResponse } from '../model';
import { AssetService } from '../service/asset.service';
import { EventService } from '../service/event.service';
import { BaseController } from './base.controller';

@controller(
  '/assets',
  MIDDLEWARE.Context
)
export class AssetsController extends BaseController {

  constructor(
    @inject(TYPE.AssetService) private assetService: AssetService,
    @inject(TYPE.EventService) private eventService: EventService,
    @inject(TYPE.LoggerService) protected logger: ILogger
  ) {
    super(logger);
  }

  @httpGet(
    '/:assetId'
  )
  public async getAssets(
    @requestParam('assetId') assetId: string
  ): Promise<APIResponse> {
    return await this.assetService.getAssetOld(new APIQuery( { assetId } ));
  }

  @httpGet(
    '/:assetId/events'
  )
  public async getEvents(
    @requestParam('assetId') assetId: string
  ): Promise<APIResponse> {
    return await this.eventService.getEventsOld(new APIQuery( {'content.idData.assetId': assetId} ));
  }
}
