import base64url from 'base64url';
import { inject, injectable } from 'inversify';

import { TYPES } from '../constant/types';
import { ILogger } from '../interface/logger.inferface';
import { getTimestamp } from '../util/helpers';
import { Web3Service } from './web3.service';
import { AuthenticationError } from '../error';
import { AuthToken } from '../model';

@injectable()
export class AuthService {
  constructor(
    @inject(TYPES.Web3Service) private web3Service: Web3Service,
    @inject(TYPES.LoggerService) private logger: ILogger
  ) {}

  public getAuthToken(authHeader: string): AuthToken {
    if (!authHeader) {
      this.logger.warn('Token error: missing authentication header');
      return undefined;
    }

    const [type, token] = authHeader.split(' ');

    if (type !== 'AMB_TOKEN') {
      this.logger.warn('Token error: missing AMB_TOKEN ');
      return undefined;
    }

    const decoded = this.decode(token);
    if (decoded == undefined) {
      this.logger.warn('Token error: decode failure');
      return undefined;
    }

    const { signature, idData } = decoded;
    if (!this.web3Service.validateSignature(idData.createdBy, signature, idData)) {
      this.logger.warn('Token error: invalid signature');
      return undefined;
    }

    const authToken = new AuthToken(idData.createdBy, idData.validUntil, signature);

    return authToken;
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
