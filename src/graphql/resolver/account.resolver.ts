import { inject, injectable } from 'inversify';

import { IGraphQLResolver } from '..';
import { TYPE } from '../../constant/types';
import { Account, APIQuery, MongoPagedResult } from '../../model';
import { AccountService } from '../../service/account.service';

@injectable()
export class AccountResolver implements IGraphQLResolver {
  public resolver;

  @inject(TYPE.AccountService)
  private accountService: AccountService;

  constructor() {
    this.resolver = {
      Query: {
        getAccounts: this.getAccounts.bind(this),
        getAccount: this.getAccount.bind(this),
      },
    };
  }

  private getAccounts(_, { next, previous, limit }, context): Promise<MongoPagedResult> {
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
