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

import { Request } from 'express';
import { inject } from 'inversify';
import { controller, httpGet, httpPost, requestParam } from 'inversify-express-utils';

import { MIDDLEWARE, TYPE } from '../constant/types';
import { ILogger } from '../interface/logger.inferface';
import { APIQuery, APIResponse } from '../model';
import { EventService } from '../service/event.service';
import { getParamValue } from '../util';
import { BaseController } from './base.controller';
import { validate } from '../middleware';
import { querySchema } from '../validation';

@controller(
  '/event',
  MIDDLEWARE.Context
)
export class EventController extends BaseController {

  constructor(
    @inject(TYPE.EventService) private eventService: EventService,
    @inject(TYPE.LoggerService) protected logger: ILogger
  ) {
    super(logger);
  }

  @httpGet(
    '/'
  )
  public async getEvents(req: Request): Promise<APIResponse> {
    const result = await this.eventService.getEvents(APIQuery.fromRequest(req));
    return APIResponse.fromMongoPagedResult(result);
  }

  @httpGet(
    '/:eventId'
  )
  public async getEvent(
    @requestParam('eventId') eventId: string
  ): Promise<APIResponse> {
    const result = await this.eventService.getEvent(eventId);
    return APIResponse.fromSingleResult(result);
  }

  @httpGet(
    '/exists/:eventId'
  )
  public async getEventExists(
    @requestParam('eventId') eventId: string
  ): Promise<APIResponse> {
    const result = await this.eventService.getEventExists(eventId);
    return APIResponse.fromSingleResult(result);
  }

  @httpPost(
    '/query',
    validate(querySchema)
  )
  public async queryEvents(req: Request): Promise<APIResponse> {
    const result = await this.eventService.getEvents(APIQuery.fromRequest(req));
    return APIResponse.fromMongoPagedResult(result);
  }

  @httpPost(
    '/search'
  )
  public async search(req: Request): Promise<APIResponse> {
    const result = await this.eventService.searchEvents(APIQuery.fromRequest(req));
    return APIResponse.fromMongoPagedResult(result);
  }

  @httpGet(
    '/lookup/types'
  )
  public async getEventTypes(): Promise<APIResponse> {
    const result = await this.eventService.getEventDistinctField('content.data.type');
    return APIResponse.fromSingleResult(result);
  }

  @httpPost(
    '/latest/type'
  )
  public async latestType(req: Request): Promise<APIResponse> {
    const assets = getParamValue(req, 'assets');
    const type = getParamValue(req, 'type');
    const result = await this.eventService.getLatestAssetEventsOfType(
      assets,
      type,
      APIQuery.fromRequest(req)
    );

    return APIResponse.fromSingleResult(result);
  }
}
