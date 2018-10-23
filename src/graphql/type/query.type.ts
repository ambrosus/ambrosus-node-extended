import { injectable } from 'inversify';

import { IGraphQLType } from '..';

@injectable()
export class QueryType implements IGraphQLType {
  public defs;

  constructor() {
    this.defs = `
      type Query {
        getAccounts(next: String, previous: String, limit: Int): AccountResults
        getAccount(address: String!): Account
        getAssets(next: String, previous: String, limit: Int): AssetResults
        getAsset(assetId: String!): Asset
        getEvents(next: String, previous: String, limit: Int): EventResults
        getEvent(eventId: String!): Event
        getBundles(next: String, previous: String, limit: Int): BundleResults
        getBundle(bundleId: String!): Bundle
      }
    `;
  }
}
