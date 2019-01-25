import { Request } from 'express';
import { inject } from 'inversify';
import { controller, httpGet, httpPost, requestParam } from 'inversify-express-utils';

import { MIDDLEWARE, TYPE } from '../constant/types';
import { ILogger } from '../interface/logger.inferface';
import { APIQuery, APIResponse } from '../model';
import { EventService } from '../service/event.service';
import { getParamValue } from '../util';
import { BaseController } from './base.controller';
import { authorize } from '../middleware/authorize.middleware';
import { validate } from '../middleware';
import { querySchema } from '../validation';

@controller(
  '/event',
  MIDDLEWARE.Context,
  authorize()
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
