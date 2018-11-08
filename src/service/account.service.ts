import { inject, injectable } from 'inversify';

import { TYPE, Permission } from '../constant/';
import { AccountRepository, AccountDetailRepository } from '../database/repository';
import {
  Account,
  APIQuery,
  MongoPagedResult,
  UserPrincipal,
  AccountDetail,
  NotFoundError,
  PermissionError,
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

  public getAccounts(apiQuery: APIQuery): Promise<MongoPagedResult> {
    if (!this.user.hasPermission(Permission.super_account)) {
      throw new PermissionError('You account has insufficient permissions to perform this task');
    }
    return this.accountRepository.getAccounts(
      apiQuery,
      this.user.organizationId,
      this.user.accessLevel,
      this.user.isSuperAdmin
    );
  }

  public getAccount(address: string): Promise<Account> {
    if (
      !this.user.hasPermission(Permission.super_account) &&
      !this.user.hasAnyPermission(Permission.manage_accounts) &&
      !(this.user.address === address)
    ) {
      throw new PermissionError('You account has insufficient permissions to perform this task');
    }

    const apiQuery = new APIQuery({ address });
    return this.accountRepository.getAccount(
      apiQuery,
      this.user.organizationId,
      this.user.accessLevel,
      this.user.isSuperAdmin
    );
  }

  public getAccountsByOrganization(organizationId: number): Promise<MongoPagedResult> {
    if (
      !this.user.hasPermission(Permission.super_account) &&
      !(
        this.user.hasPermission(Permission.manage_accounts) &&
        this.user.organizationId === organizationId
      )
    ) {
      throw new PermissionError('You account has insufficient permissions to perform this task');
    }
    const apiQuery = new APIQuery({organization: organizationId});
    return this.accountRepository.getAccounts(
      apiQuery,
      this.user.organizationId,
      this.user.accessLevel,
      this.user.isSuperAdmin
    );
  }

  public async updateAccountDetail(
    address: string,
    accountDetail: AccountDetail
  ): Promise<Account> {
    const apiQuery = new APIQuery({ address });

    // First check if the current user can access this account
    const currentAccount = await this.getAccount(address);
    if (!currentAccount) {
      throw new PermissionError('You account has insufficient permissions to perform this task');
    }

    // Update accountDetail collection
    accountDetail.setMutationTimestamp(this.user.address);
    await this.accountDetailRepository.update(apiQuery, accountDetail, true);

    // Finally return the account and accountDetail document joined
    return this.getAccount(address);
  }

  public getAccountForAuth(address: string): Promise<Account> {
    const apiQuery = new APIQuery({ address });
    return this.accountRepository.getAccountForAuthorization(apiQuery);
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
