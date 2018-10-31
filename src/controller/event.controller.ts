import { Request } from 'express';
import { inject } from 'inversify';
import {
  BaseHttpController,
  controller,
  httpGet,
  httpPost,
  requestParam,
} from 'inversify-express-utils';

import { MIDDLEWARE, TYPE } from '../constant/types';
import { APIQuery, APIResponse, APIResponseMeta } from '../model';
import { EventService } from '../service/event.service';
import { getParamValue } from '../util/helpers';

@controller('/event', MIDDLEWARE.Authorized)
export class EventController {
  constructor(@inject(TYPE.EventService) private eventService: EventService) {}

  @httpGet('/')
  public async getEvents(req: Request): Promise<APIResponse> {
    const result = await this.eventService.getEvents(APIQuery.fromRequest(req));
    const apiResponse = APIResponse.fromMongoPagedResult(result);
    apiResponse.meta = new APIResponseMeta(200);
    return apiResponse;
  }

  @httpGet('/:eventId')
  public async getEvent(@requestParam('eventId') eventId: string): Promise<APIResponse> {
    const result = await this.eventService.getEvent(eventId);
    const apiResponse = new APIResponse(result);
    apiResponse.meta = new APIResponseMeta(200);
    return apiResponse;
  }

  @httpGet('/exists/:eventId')
  public async getEventExists(@requestParam('eventId') eventId: string): Promise<APIResponse> {
    const result = await this.eventService.getEventExists(eventId);
    const apiResponse = new APIResponse();
    apiResponse.meta = new APIResponseMeta(200);
    apiResponse.meta.exists = result;
    return apiResponse;
  }

  @httpPost('/query')
  public async queryEvents(req: Request): Promise<APIResponse> {
    const result = await this.eventService.getEvents(APIQuery.fromRequest(req));
    const apiResponse = APIResponse.fromMongoPagedResult(result);
    apiResponse.meta = new APIResponseMeta(200);
    return apiResponse;
  }

  @httpPost('/latest/type')
  public async latestType(req: Request): Promise<APIResponse> {
    const assets = getParamValue(req, 'assets');
    const type = getParamValue(req, 'type');
    const result = await this.eventService.getLatestAssetEventsOfType(
      assets,
      type,
      APIQuery.fromRequest(req)
    );
    const apiResponse = APIResponse.fromMongoPagedResult(result);
    apiResponse.meta = new APIResponseMeta(200);
    return apiResponse;
  }
}
