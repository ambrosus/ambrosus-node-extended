import { injectable } from 'inversify';
import { AmbrosusError } from '../error/ambrosus.error';
import { getTimestamp } from '../util/helpers';

export interface IAuthToken {
  createdBy: string;
  validUntil: number;
  signature: string;
  authError: AmbrosusError;

  isValid(): boolean;
}

@injectable()
export class AuthToken implements IAuthToken {
  public authError;
  constructor(public createdBy: string, public validUntil: number, public signature: string) {}

  isValid(): boolean {
    if (this.validUntil && this.validUntil >= getTimestamp()) {
      return true;
    }
    return false;
  }
}
