import { injectable } from 'inversify';

import { IGraphQLType } from '..';

@injectable()
export class AccountType implements IGraphQLType {
  public defs;

  constructor() {
    this.defs = `
    
    type AccountResults {
      results: [Account!]!
      hasNext: Boolean
      next: String
      hasPrevious: Boolean
      previous: String
    }
    
    type Account {
        address: String
        accessLevel: Int
        organization: String
        permissions: [String]
        registeredOn: Float
        registeredBy: String
      }
      
    `;
  }
}
