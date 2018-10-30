import { inject, injectable } from 'inversify';

import { IGraphQLResolver } from '..';
import { TYPE } from '../../constant/types';
import { APIQuery, APIResult, Asset } from '../../model';
import { AssetService } from '../../service/asset.service';

@injectable()
export class AssetResolver implements IGraphQLResolver {
  public resolver;

  @inject(TYPE.AssetService)
  private assetService: AssetService;

  constructor() {
    this.resolver = {
      Query: {
        getAssets: this.getAssets.bind(this),
        getAsset: this.getAsset.bind(this),
      },
    };
  }

  private getAssets(_, { next, previous, limit }, context): Promise<APIResult> {
    const apiQuery = new APIQuery();
    apiQuery.next = next;
    apiQuery.previous = previous;
    apiQuery.limit = limit;
    return this.assetService.getAssets(apiQuery);
  }

  private getAsset(_, { assetId }, args, context): Promise<Asset> {
    return this.assetService.getAsset(assetId);
  }
}
