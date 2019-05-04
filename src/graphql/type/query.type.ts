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
