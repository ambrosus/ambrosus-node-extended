import base64url from 'base64url';
import { inject, injectable } from 'inversify';

import { TYPE } from '../constant/types';
import { ILogger } from '../interface/logger.inferface';
import { AuthToken } from '../model';
import { Web3Service } from './web3.service';

import { ValidationError } from '../errors';

@injectable()
export class AuthService {
  constructor(
    @inject(TYPE.Web3Service) private web3Service: Web3Service,
    @inject(TYPE.LoggerService) private logger: ILogger
  ) { }

  public getAuthToken(authHeader: string): AuthToken {
    if (!authHeader) {
      this.logger.debug('getAuthToken: missing authentication header');
      throw new ValidationError({ reason: 'Invalid token' });
    }

    const [type, token] = authHeader.split(' ');

    if (type !== 'AMB_TOKEN') {
      this.logger.debug('getAuthToken: AMB_TOKEN not found in authentication header');
      throw new ValidationError({ reason: 'Invalid token' });
    }

    const decoded = this.decode(token);
    if (decoded === undefined) {
      this.logger.debug('getAuthToken: failed to decode AMB_TOKEN');
      throw new ValidationError({ reason: 'Invalid token' });
    }

    const { signature, idData } = decoded;
    if (!this.web3Service.validateSignature(idData.createdBy, signature, idData)) {
      this.logger.debug('getAuthToken: failed to validate signature');
      throw new ValidationError({ reason: 'Invalid token' });
    }

    const authToken = new AuthToken();
    authToken.createdBy = idData.createdBy;
    authToken.validUntil = idData.validUntil;
    authToken.signature = signature;
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
