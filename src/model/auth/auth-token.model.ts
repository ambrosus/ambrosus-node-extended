import { injectable } from 'inversify';

import { AmbrosusError } from '../../model';
import { getTimestamp } from '../../util/helpers';

export interface IAuthToken {
  createdBy: string;
  validUntil: number;
  signature: string;
  authError: AmbrosusError;

  isValid(): boolean;
}

@injectable()
export class AuthToken implements IAuthToken {
  public createdBy;
  public validUntil;
  public signature;
  public authError;

  public isValid(): boolean {
    if (!this.authError && this.validUntil && this.validUntil >= getTimestamp()) {
      return true;
    }
    return false;
  }
}
