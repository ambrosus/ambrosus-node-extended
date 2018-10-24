import { inject, injectable } from 'inversify';

import { IGraphQLResolver } from '..';
import { TYPES } from '../../constant/types';
import { APIQuery, APIResult, Event } from '../../model';
import { EventService } from '../../service/event.service';

@injectable()
export class EventResolver implements IGraphQLResolver {
  public resolver;

  @inject(TYPES.EventService)
  private eventService: EventService;

  constructor() {
    this.resolver = {
      Query: {
        getEvents: this.getEvents.bind(this),
        getEvent: this.getEvent.bind(this),
      },
    };
  }

  private getEvents(_, { next, previous, limit }, context): Promise<APIResult> {
    const apiQuery = new APIQuery();
    apiQuery.next = next;
    apiQuery.previous = previous;
    apiQuery.limit = limit;
    return this.eventService.getEvents(apiQuery);
  }

  private getEvent(_, { eventId }, args, context): Promise<Event> {
    return this.eventService.getEvent(eventId);
  }
}
