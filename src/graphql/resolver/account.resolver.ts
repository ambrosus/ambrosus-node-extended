import { inject, injectable } from 'inversify';

import { IGraphQLResolver } from '..';
import { TYPES } from '../../constant/types';
import { AccountService } from '../../service/account.service';
import { Account } from '../../model';
@injectable()
export class AccountResolver implements IGraphQLResolver {
  public resolver;

  @inject(TYPES.AccountService)
  private accountService: AccountService;

  constructor() {
    this.resolver = {
      Query: {
        accounts: this.getAccounts.bind(this),
        account: this.getAccount.bind(this),
      },
    };
  }

  private getAccounts(_, args, context): Promise<number> {
    return this.accountService.getCountTotal();
  }

  private getAccount(_, { address }, args, context): Promise<Account> {
    return this.accountService.getAccount(address);
  }
}
