import { inject, injectable } from 'inversify';

import { IGraphQLResolver } from '..';
import { TYPES } from '../../constant/types';
import { AssetService } from '../../service/asset.service';
import { Asset, APIResult, APIQuery } from '../../model';
@injectable()
export class AssetResolver implements IGraphQLResolver {
  public resolver;

  @inject(TYPES.AssetService)
  private assetService: AssetService;

  constructor() {
    this.resolver = {
      Query: {
        getAssets: this.getAssets.bind(this),
        getAsset: this.getAsset.bind(this),
      },
    };
  }

  private getAssets(_, { next, previous, limit}, context): Promise<APIResult> {
    console.log("getAssets");
    const apiQuery = new APIQuery();
    apiQuery.next = next;
    apiQuery.previous = previous;
    apiQuery.limit = limit;
    return this.assetService.getAssets(apiQuery);
  }

  private getAsset(_, { assetId }, args, context): Promise<Asset> {
    console.log("getAsset");
    return this.assetService.getAsset(assetId);
  }
}
