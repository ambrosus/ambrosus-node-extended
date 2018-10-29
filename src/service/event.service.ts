import { inject, injectable } from 'inversify';

import { TYPES } from '../constant/types';
import { EventRepository } from '../database/repository';
import { APIQuery, APIResult, Event, UserPrincipal } from '../model';

@injectable()
export class EventService {
  constructor(
    @inject(TYPES.UserPrincipal) private readonly user: UserPrincipal,
    @inject(TYPES.EventRepository) private readonly eventRepository: EventRepository
  ) {}

  public getEvents(apiQuery: APIQuery): Promise<APIResult> {
    apiQuery.paginationField = 'content.idData.timestamp';
    apiQuery.sortAscending = false;
    return this.eventRepository.query(apiQuery, this.user.accessLevel);
  }

  public getEvent(eventId: string): Promise<Event> {
    const apiQuery = new APIQuery();
    apiQuery.query = { eventId };
    return this.eventRepository.single(apiQuery, this.user.accessLevel);
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
