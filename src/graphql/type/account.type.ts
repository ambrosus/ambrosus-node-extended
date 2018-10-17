import { injectable } from 'inversify';

import { IGraphQLType } from '..';

@injectable()
export class AccountType implements IGraphQLType {
  public defs;

  constructor() {
    this.defs = `
      type Account {
        address: String
        accessLevel: Int
        registeredOn: String
      }
    `;
  }
}
