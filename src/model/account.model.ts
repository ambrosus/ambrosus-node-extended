import { injectable } from 'inversify';
import { add } from 'winston';

export interface IAccount {
  _id: string;
  address: string;
  accessLevel: number;
  organization: number;
  permissions: string[];
  registeredOn: number;
  registeredBy: string;
}

@injectable()
export class Account implements IAccount {
  public _id: string;
  public address: string;
  public accessLevel: number;
  public organization: number;
  public permissions: string[];
  public registeredOn: number;
  public registeredBy: string;

  constructor(address: string, accessLevel: number, organization: number) {
    this.address = address;
    this.accessLevel = accessLevel;
    this.organization = organization;
  }
}
