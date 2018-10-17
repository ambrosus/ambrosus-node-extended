import { injectable } from 'inversify';

import { IGraphQLType } from '..';

@injectable()
export class BundleType implements IGraphQLType {
  public defs;

  constructor() {
    this.defs = `
      type Bundle {
        bundleId: String
      }
    `;
  }
}
