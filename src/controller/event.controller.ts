import { Request } from 'express';
import { inject } from 'inversify';
import { controller, httpGet, httpPost, requestParam } from 'inversify-express-utils';

import { MIDDLEWARE, TYPE } from '../constant/types';
import { APIQuery, APIResponse } from '../model';
import { EventService } from '../service/event.service';
import { getParamValue } from '../util/helpers';
import { BaseController } from './base.controller';

@controller('/event', MIDDLEWARE.Authorized)
export class EventController extends BaseController {
  constructor(@inject(TYPE.EventService) private eventService: EventService) {
    super();
  }

  @httpGet('/')
  public async getEvents(req: Request): Promise<APIResponse> {
    try {
      const result = await this.eventService.getEvents(APIQuery.fromRequest(req));
      const apiResponse = APIResponse.fromMongoPagedResult(result);
      return apiResponse;
    } catch (err) {
      return super.handleError(err);
    }
  }

  @httpGet('/:eventId')
  public async getEvent(@requestParam('eventId') eventId: string): Promise<APIResponse> {
    try {
      const result = await this.eventService.getEvent(eventId);
      const apiResponse = new APIResponse(result);
      return apiResponse;
    } catch (err) {
      return super.handleError(err);
    }
  }

  @httpGet('/exists/:eventId')
  public async getEventExists(@requestParam('eventId') eventId: string): Promise<APIResponse> {
    try {
      const result = await this.eventService.getEventExists(eventId);
      const apiResponse = new APIResponse();
      apiResponse.meta.exists = result;
      return apiResponse;
    } catch (err) {
      return super.handleError(err);
    }
  }

  @httpPost('/query')
  public async queryEvents(req: Request): Promise<APIResponse> {
    try {
      const result = await this.eventService.getEvents(APIQuery.fromRequest(req));
      const apiResponse = APIResponse.fromMongoPagedResult(result);
      return apiResponse;
    } catch (err) {
      return super.handleError(err);
    }
  }

  @httpPost('/search')
  public async search(req: Request): Promise<APIResponse> {
    try {
      const result = await this.eventService.searchEvents(APIQuery.fromRequest(req));
      const apiResponse = APIResponse.fromMongoPagedResult(result);
      return apiResponse;
    } catch (err) {
      return super.handleError(err);
    }
  }

  @httpGet('/lookup/types')
  public async getEventTypes(req: Request): Promise<APIResponse> {
    try {
      const result = await this.eventService.getEventDistinctField('content.data.type');
      const apiResponse = new APIResponse(result);
      return apiResponse;
    } catch (err) {
      return super.handleError(err);
    }
  }

  @httpPost('/latest/type')
  public async latestType(req: Request): Promise<APIResponse> {
    try {
      const assets = getParamValue(req, 'assets');
      const type = getParamValue(req, 'type');
      const result = await this.eventService.getLatestAssetEventsOfType(
        assets,
        type,
        APIQuery.fromRequest(req)
      );
      const apiResponse = new APIResponse(result);
      return apiResponse;
    } catch (err) {
      return super.handleError(err);
    }
  }
}
