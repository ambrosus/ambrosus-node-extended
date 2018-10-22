import { injectable } from 'inversify';
import { Account, AuthToken } from './';

export interface IUser {
  account: Account;
  authToken: AuthToken;
}

@injectable()
export class User implements IUser {
  public account: Account;
  public authToken: AuthToken;
  constructor() {}
}
