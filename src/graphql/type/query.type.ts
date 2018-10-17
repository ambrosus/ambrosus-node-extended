import { injectable } from 'inversify';

import { IGraphQLType } from '..';

@injectable()
export class QueryType implements IGraphQLType {
  public defs;

  constructor() {
    this.defs = `
      type Query {
        accounts: [Account]
        account(address: String!): Account
        assets: [Asset]
        asset(assetId: String!): Asset
        events: [Event]
        event(eventId: String!): Event
        bundles: [Bundle]
        bundle(bundleId: String!): Bundle
      }
    `;
  }
}
