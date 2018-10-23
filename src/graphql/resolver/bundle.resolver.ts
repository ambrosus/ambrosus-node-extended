import { inject, injectable } from 'inversify';

import { IGraphQLResolver } from '..';
import { TYPES } from '../../constant/types';
import { BundleService } from '../../service/bundle.service';
import { Bundle, APIQuery, APIResult } from '../../model';

@injectable()
export class BundleResolver implements IGraphQLResolver {
  public resolver;

  @inject(TYPES.BundleService)
  private bundleService: BundleService;

  constructor() {
    this.resolver = {
      Query: {
        getBundles: this.getBundles.bind(this),
        getBundle: this.getBundle.bind(this),
      },
    };
  }

  private getBundles(_, { next, previous, limit}, context): Promise<APIResult> {
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
