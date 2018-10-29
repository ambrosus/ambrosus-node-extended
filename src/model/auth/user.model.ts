import { injectable } from 'inversify';

import { Account, AuthToken } from '../';

export interface IUser {
  account: Account;
  authToken: AuthToken;

  isAuthorized(): boolean;
  hasRole(role: string): boolean;
  hasPermission(permission: string): boolean;
}

@injectable()
export class User implements IUser {
  public account: Account;
  public authToken: AuthToken;

  public hasRole(role: string): boolean {
    return true;
  }

  public hasPermission(permission: string): boolean {
    return true;
  }

  public isAuthorized(): boolean {
    return this.account && this.authToken && this.authToken.isValid();
  }

  public isValid() {
    return this.account && this.authToken && this.authToken.isValid();
  }

  get address(): string {
    return this.account.address;
  }

  get accessLevel(): number {
    return this.account.accessLevel;
  }
}
