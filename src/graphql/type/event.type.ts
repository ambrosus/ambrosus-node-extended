import { injectable } from 'inversify';

import { IGraphQLType } from '..';

@injectable()
export class EventType implements IGraphQLType {
  public defs;

  constructor() {
    this.defs = `
    type EventResults {
      results: [Event]
      hasNext: Boolean
      next: String
      hasPrevious: Boolean
      previous: String
    }
    type EventContent {
      signature: String
      idData: EventIdData

    }
    type EventIdData {
      assetId: String
      createdBy: String
      accessLevel: Int
      timestamp: Float
    }
    type Event {
      eventId: String
      content: EventContent
    }
    `;
  }
}
