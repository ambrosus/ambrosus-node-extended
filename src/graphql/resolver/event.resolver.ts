import { inject, injectable } from 'inversify';

import { IGraphQLResolver } from '..';
import { TYPES } from '../../constant/types';
import { EventService } from '../../service/event.service';
import { Event, APIResult, APIQuery } from '../../model';

@injectable()
export class EventResolver implements IGraphQLResolver {
  public resolver;

  @inject(TYPES.EventService)
  private eventService: EventService;

  constructor() {
    this.resolver = {
      Query: {
        getEvents: this.getEvents.bind(this),
        getEvent: this.getEvent.bind(this)
      }
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
