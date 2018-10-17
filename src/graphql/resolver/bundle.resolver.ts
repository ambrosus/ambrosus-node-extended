import { inject, injectable } from 'inversify';

import { IGraphQLResolver } from '..';
import { TYPES } from '../../constant/types';
import { BundleService } from '../../service/bundle.service';
import { Bundle } from '../../model';

@injectable()
export class AssetResolver implements IGraphQLResolver {
  public resolver;

  @inject(TYPES.AccountService)
  private bundleService: BundleService;

  constructor() {
    this.resolver = {
      Query: {
        bundles: this.getBundles.bind(this),
        bundle: this.getBundle.bind(this),
      },
    };
  }

  private getBundles(_, args, context): Promise<number> {
    return this.bundleService.getCountTotal();
  }

  private getBundle(_, { bundleId }, args, context): Promise<Bundle> {
    return this.bundleService.getBundle(bundleId);
  }
}
