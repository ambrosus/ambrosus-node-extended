import { inject, injectable } from 'inversify';

import { IGraphQLResolver } from '..';
import { TYPES } from '../../constant/types';
import { AssetService } from '../../service/asset.service';
import { Asset } from '../../model';
@injectable()
export class AssetResolver implements IGraphQLResolver {
  public resolver;

  @inject(TYPES.AccountService)
  private assetService: AssetService;

  constructor() {
    this.resolver = {
      Query: {
        assets: this.getAssets.bind(this),
        asset: this.getAsset.bind(this),
      },
    };
  }

  private getAssets(_, args, context): Promise<number> {
    return this.assetService.getCountTotal();
  }

  private getAsset(_, { assetId }, args, context): Promise<Asset> {
    return this.assetService.getAsset(assetId);
  }
}
