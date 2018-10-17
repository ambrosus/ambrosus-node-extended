import { injectable } from 'inversify';

import { IGraphQLType } from '..';

@injectable()
export class AssetType implements IGraphQLType {
  public defs;

  constructor() {
    this.defs = `
      type Asset {
        assetId: String
      }
    `;
  }
}
