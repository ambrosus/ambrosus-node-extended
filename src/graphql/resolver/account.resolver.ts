import { inject, injectable } from 'inversify';

import { IGraphQLResolver } from '..';
import { TYPES } from '../../constant/types';
import { AccountService } from '../../service/account.service';
import { Account, APIResult, APIQuery } from '../../model';
@injectable()
export class AccountResolver implements IGraphQLResolver {
  public resolver;

  @inject(TYPES.AccountService)
  private accountService: AccountService;

  constructor() {
    this.resolver = {
      Query: {
        getAccounts: this.getAccounts.bind(this),
        getAsset: this.getAccount.bind(this),
      },
    };
  }

  private getAccounts(_, { next, previous, limit}, context): Promise<APIResult> {
    const apiQuery = new APIQuery();
    apiQuery.next = next;
    apiQuery.previous = previous;
    apiQuery.limit = limit;
    return this.accountService.getAccounts(apiQuery);
  }

  private getAccount(_, { address }, args, context): Promise<Account> {
    return this.accountService.getAccount(address);
  }
}
 