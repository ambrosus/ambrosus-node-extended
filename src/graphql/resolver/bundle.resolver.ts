/*
 * Copyright: Ambrosus Inc.
 * Email: tech@ambrosus.io
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
import { APIQuery, Bundle, MongoPagedResult } from '../../model';
import { BundleService } from '../../service/bundle.service';

@injectable()
export class BundleResolver implements IGraphQLResolver {
  public resolver;

  @inject(TYPE.BundleService)
  private bundleService: BundleService;

  constructor() {
    this.resolver = {
      Query: {
        getBundles: this.getBundles.bind(this),
        getBundle: this.getBundle.bind(this),
      },
    };
  }

  private getBundles(_, { next, previous, limit }, context): Promise<MongoPagedResult> {
    const apiQuery = new APIQuery();
    apiQuery.next = next;
    apiQuery.previous = previous;
    apiQuery.limit = limit;
    return this.bundleService.getBundles(apiQuery);
  }

  private getBundle(_, { bundleId }, args, context): Promise<Bundle> {
    return this.bundleService.getBundle(bundleId);
  }
}
