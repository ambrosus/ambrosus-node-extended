import { inject, injectable } from 'inversify';

import { IGraphQLResolver } from '..';
import { TYPES } from '../../constant/types';
import { EventService } from '../../service/event.service';
import { Event } from '../../model';

@injectable()
export class EventResolver implements IGraphQLResolver {
  public resolver;

  @inject(TYPES.AccountService)
  private eventService: EventService;

  constructor() {
    this.resolver = {
      Query: {
        events: this.getBundles.bind(this),
        event: this.getBundle.bind(this),
      },
    };
  }

  private getBundles(_, args, context): Promise<number> {
    return this.eventService.getCountTotal();
  }

  private getBundle(_, { eventId }, args, context): Promise<Event> {
    return this.eventService.getEvent(eventId);
  }
}
