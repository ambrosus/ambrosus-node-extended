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
import {
  controller,
  httpGet,
  httpPost,
  requestParam,
  requestHeaders,
  requestBody
} from 'inversify-express-utils';

import { MIDDLEWARE, TYPE } from '../constant/types';
import { ILogger } from '../interface/logger.inferface';
import { APIQuery, APIResponse } from '../model';
import { EventService } from '../service/event.service';
import { getParamValue } from '../util';
import { BaseController } from './base.controller';
import { authorize } from '../middleware/authorize.middleware';
import { validate } from '../middleware';
import { querySchema, eventSchema } from '../validation/schemas';
import { AuthService } from '../service/auth.service';

import { Web3Service } from '../service/web3.service';

@controller(
  '/event2',
  MIDDLEWARE.Context
)
export class Event2Controller extends BaseController {

  constructor(
    @inject(TYPE.EventService) private eventService: EventService,
    @inject(TYPE.LoggerService) protected logger: ILogger,
    @inject(TYPE.AuthService) private authService: AuthService,
    @inject(TYPE.Web3Service) private web3Service: Web3Service
  ) {
    super(logger);
  }

  @httpGet(
    '/list'
  )
  public async getEvents(req: Request): Promise<APIResponse> {
    const result = await this.eventService.getEvents(APIQuery.fromRequest(req));
    return APIResponse.fromMongoPagedResult(result);
  }

  @httpGet(
    '/info/:eventId'
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

  @httpPost(
    '/create/:eventId',
    authorize('create_event'),
    validate(eventSchema.eventCreate)
  )
  public async createAsset(
    @requestParam('eventId') eventId: string,
    @requestHeaders('authorization') authorization: string,
    @requestBody() payload: {
      idData: {
        assetId: string,
        timestamp: number,
        accessLevel: number,
        createdBy: string,
        dataHash: string
      },
      signature: string,
      data: object[]      
    }
  ): Promise<APIResponse> {
    const authToken = this.authService.getAuthToken(authorization);

    this.web3Service.validateSignature2(
      authToken.createdBy, 
      payload.signature, 
      payload.idData
    );

    await this.eventService.createEvent(
      eventId,
      payload.idData.assetId,
      payload.idData.accessLevel,
      payload.idData.timestamp,
      authToken.createdBy,
      payload.idData.dataHash,
      payload.signature,
      payload.data
    );

    const result = await this.eventService.getEvent(eventId);

    return APIResponse.fromSingleResult(result);
  }
}
