import { injectable } from 'inversify';

import { IGraphQLType } from '..';

@injectable()
export class AssetType implements IGraphQLType {
  public defs;

  constructor() {
    this.defs = `
    
    type AssetResults {
      results: [Asset]
      hasNext: Boolean
      next: String
      hasPrevious: Boolean
      previous: String
    }

    type AssetContent {
      signature: String
      idData: AssetIdData
    }

    type AssetMetaData {
      bundleId: String
      bundleTransactionHash: String
    }

    type AssetIdData {
      createdBy: String
      timestamp: Int
      sequenceNumber: Int
    }
    
    type Asset {
      assetId: String
      content: AssetContent
      metadata: AssetMetaData
    }

    `;
  }
}
