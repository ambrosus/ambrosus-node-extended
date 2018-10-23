import { injectable } from 'inversify';

import { IGraphQLType } from '..';

@injectable()
export class AssetType implements IGraphQLType {
  public defs;

  constructor() {
    this.defs = `
    
      type AssetResults {
        results: [Asset!]!
        hasNext: Boolean
        next: String
        hasPrevious: Boolean
        previous: String
      }

      type Asset {
        assetId: String
      }

    `;
  }
}
