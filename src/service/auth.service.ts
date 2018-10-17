import base64url from 'base64url';
import { inject, injectable } from 'inversify';

import { TYPES } from '../constant/types';
import { ILogger } from '../interface/logger.inferface';
import { getTimestamp } from '../util/helpers';
import { Web3Service } from './web3.service';

@injectable()
export class AuthService {
  constructor(
    @inject(TYPES.Web3Service) private web3Service: Web3Service,
    @inject(TYPES.LoggerService) private logger: ILogger
  ) {}

  public isAuthorized(token: string) {
    const decoded = this.decode(token);

    if (decoded) {
      this.logger.warn('Token: Failed to decode');
      return false;
    }

    const { signature, idData } = decoded;

    if (!this.web3Service.validateSignature(idData.createdBy, signature, idData)) {
      this.logger.warn('Token: Invalid signature');
      return false;
    }

    if (!decoded.idData.validUntil) {
      this.logger.warn("Token: Missing 'validUntil'");
      return false;
    }
    if (decoded.idData.validUntil < getTimestamp()) {
      this.logger.warn('Token: Has expired');
      return false;
    }

    return true;
  }

  public encode(data) {
    return base64url(this.web3Service.serializeForHashing(data));
  }

  private decode(token) {
    try {
      return JSON.parse(base64url.decode(token));
    } catch (_e) {
      return undefined;
    }
  }
}
