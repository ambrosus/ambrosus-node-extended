import { injectable } from 'inversify';

export interface IAccountDetail {
  _id: string;
  address: string;
  fullName: string;
  email: string;
  password: string;
  token: number;
  extendedPermissions: string[];
  timezone: string;
  lastSeen: number;
}

@injectable()
export class AccountDetail implements IAccountDetail {
  public _id: string;
  public address: string;
  public fullName: string;
  public email: string;
  public password: string;
  public token: number;
  public extendedPermissions: string[];
  public timezone: string;
  public lastSeen: number;
}
