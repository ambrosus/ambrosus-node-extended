import { injectable } from 'inversify';

import { IGraphQLType } from '..';

@injectable()
export class EventType implements IGraphQLType {
  public defs;

  constructor() {
    this.defs = `
      type Event {
        eventId: String
      }
    `;
  }
}
