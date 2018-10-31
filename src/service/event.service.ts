import { inject, injectable } from 'inversify';

import { TYPE } from '../constant/types';
import { EventRepository } from '../database/repository';
import { APIQuery, APIResult, Event, UserPrincipal } from '../model';

@injectable()
export class EventService {
  constructor(
    @inject(TYPE.UserPrincipal) private readonly user: UserPrincipal,
    @inject(TYPE.EventRepository) private readonly eventRepository: EventRepository
  ) {}

  public getEventExists(eventId: string) {
    return this.eventRepository.existsOR({ eventId }, 'eventId');
  }

  public getEvents(apiQuery: APIQuery): Promise<APIResult> {
    apiQuery.paginationField = 'content.idData.timestamp';
    apiQuery.sortAscending = false;
    return this.eventRepository.queryEvents(apiQuery, this.user.accessLevel);
  }

  public getEvent(eventId: string): Promise<Event> {
    const apiQuery = new APIQuery();
    apiQuery.query = { eventId };
    return this.eventRepository.queryEvent(apiQuery, this.user.accessLevel);
  }

  public getLatestAssetEventsOfType(
    assets: string[],
    type: string,
    apiQuery: APIQuery
  ): Promise<APIResult> {
    apiQuery.paginationField = 'content.idData.timestamp';
    apiQuery.sortAscending = false;
    return this.eventRepository.assetEventsOfType(assets, type, apiQuery);
  }
}
