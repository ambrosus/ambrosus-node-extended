import { inject, injectable } from 'inversify';

import { TYPE } from '../constant/types';
import { AccountRepository } from '../database/repository';
import { Account, APIQuery, MongoPagedResult, UserPrincipal } from '../model';

@injectable()
export class AccountService {
  constructor(
    @inject(TYPE.UserPrincipal) private readonly user: UserPrincipal,
    @inject(TYPE.AccountRepository) private readonly accountRepository: AccountRepository
  ) {}

  public getAccountExists(address: string) {
    return this.accountRepository.existsOR({ address }, 'address');
  }

  public getAccounts(query: APIQuery): Promise<MongoPagedResult> {
    return this.accountRepository.queryAccounts(query, this.user.accessLevel);
  }

  public getAccount(address: string): Promise<Account> {
    const apiQuery = new APIQuery({ address });
    return this.accountRepository.queryAccount(apiQuery, this.user.accessLevel);
  }

  public getAccountForAuth(address: string): Promise<Account> {
    const apiQuery = new APIQuery({ address });
    return this.accountRepository.getAccountForAuthorization(apiQuery);
  }
}
