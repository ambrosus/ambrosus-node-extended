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

import { inject, injectable } from 'inversify';

import { IGraphQLResolver } from '..';
import { TYPE } from '../../constant/types';
import { APIQuery, Event, MongoPagedResult } from '../../model';
import { EventService } from '../../service/event.service';

@injectable()
export class EventResolver implements IGraphQLResolver {
  public resolver;

  @inject(TYPE.EventService)
  private eventService: EventService;

  constructor() {
    this.resolver = {
      Query: {
        getEvents: this.getEvents.bind(this),
        getEvent: this.getEvent.bind(this),
      },
    };
  }

  private getEvents(_, { next, previous, limit }, context): Promise<MongoPagedResult> {
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
