import { injectable } from 'inversify';

export interface IAccount {
  _id?: string;
  address: string;
  accessLevel: number;
  organization: string;
  permissions: string[];
  registeredOn: number;
  registeredBy: string;
}

@injectable()
export class Account implements IAccount {
  public _id?: string;
  public address: string;
  public accessLevel: number;
  public organization: string;
  public permissions: string[];
  public registeredOn: number;
  public registeredBy: string;

  constructor() {}
}
