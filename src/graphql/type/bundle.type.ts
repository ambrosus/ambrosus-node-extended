import { injectable } from 'inversify';

import { IGraphQLType } from '..';

@injectable()
export class BundleType implements IGraphQLType {
  public defs;

  constructor() {
    this.defs = `

      type BundleResults {
        results: [Bundle!]!
        hasNext: Boolean
        next: String
        hasPrevious: Boolean
        previous: String
      }

      type Bundle {
        bundleId: String
      }

    `;
  }
}
