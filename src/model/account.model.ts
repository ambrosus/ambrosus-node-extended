import { injectable } from 'inversify';

export interface IAccount {
  _id?: string;
  address: string;
  accessLevel: number;
  registeredOn: string;
}

@injectable()
export class Account implements IAccount {
  constructor(
    public address: string,
    public accessLevel: number,
    public registeredOn: string,
    public _id?: string
  ) {}
}
