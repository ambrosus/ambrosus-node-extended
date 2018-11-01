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
