/*
 * Copyright: Ambrosus Inc.
 * Email: tech@ambrosus.io
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files
 * (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

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
