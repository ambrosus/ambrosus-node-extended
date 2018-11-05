import { inject, injectable } from 'inversify';

import { TYPE } from '../constant/types';
import { AccountRepository, AccountDetailRepository } from '../database/repository';
import {
  Account,
  APIQuery,
  MongoPagedResult,
  UserPrincipal,
  AccountDetail,
  NotFoundError,
} from '../model';

@injectable()
export class AccountService {
  constructor(
    @inject(TYPE.UserPrincipal) private readonly user: UserPrincipal,
    @inject(TYPE.AccountRepository) private readonly accountRepository: AccountRepository,
    @inject(TYPE.AccountDetailRepository)
    private readonly accountDetailRepository: AccountDetailRepository
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

  public async getAccountDetail(address: string): Promise<AccountDetail> {
    if (!(await this.getAccountExists(address))) {
      throw new NotFoundError('Account not found');
    }

    const apiQuery = new APIQuery({ address });
    return this.accountDetailRepository.findOneOrCreate(apiQuery, this.user.account.address);
  }

  public updateAccountDetail(
    address: string,
    accountDetail: AccountDetail
  ): Promise<AccountDetail> {
    const apiQuery = new APIQuery({ address });
    accountDetail.setMutationTimestamp(this.user.address);
    return this.accountDetailRepository.update(apiQuery, accountDetail, true);
  }

  public getAccountEncryptedToken(email: string): Promise<AccountDetail> {
    const apiQuery = new APIQuery({ email });
    apiQuery.fields = {
      _id: 0,
      token: 1,
    };
    return this.accountDetailRepository.findOne(apiQuery);
  }
}
