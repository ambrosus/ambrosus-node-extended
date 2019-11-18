/*
 * Copyright: Ambrosus Inc.
 * Email: tech@ambrosus.com
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

import { inject, injectable } from 'inversify';
// tslint:disable-next-line:no-var-requires
const web3 = require('web3');
import * as moment from 'moment';
import base64url from 'base64url';

import { config } from '../config';
import { TYPE } from '../constant/types';
import { ILogger } from '../interface/logger.inferface';
import { matchHexOfLength } from '../util';

import { ValidationError, AuthenticationError } from '../errors';

@injectable()
export class Web3Service {
  private web3;
  private w3Account;
  private privateKey = config.web3.privateKey;

  constructor(@inject(TYPE.LoggerService) public logger: ILogger) {
    if (!matchHexOfLength(this.privateKey, 64)) {
      throw new ValidationError({ reason: 'Invalid private key format' });
    }

    this.web3 = new web3();
    this.w3Account = this.web3.eth.accounts.privateKeyToAccount(
      this.privateKey
    );
    this.web3.eth.accounts.wallet.add(this.w3Account);
    this.web3.eth.defaultAccount = this.w3Account.address;
    this.web3.setProvider(config.web3.rpc);
  }

  public async isAddress(address) {
    return await this.web3.utils.isAddress(address);
  }

  public getToken(secret, timestamp = '') {
    const idData = {
      createdBy: this.addressFromSecret(secret),
      validUntil: timestamp || moment().add(5, 'days').unix(),
    };

    return base64url(this.serializeForHashing({
      idData,
      signature: this.sign(idData, secret),
    }));
  }

  public async getBalance() {
    return await this.web3.eth.getBalance(this.w3Account.address);
  }

  public createKeyPair() {
    return this.web3.eth.accounts.create(this.web3.utils.randomHex(32));
  }

  public sign(data, privateKey = '') {
    const { signature } = this.web3.eth.accounts.sign(
      this.serializeForHashing(data),
      privateKey || this.privateKey
    );

    return signature;
  }

  public addressFromSecret(secret) {
    try {
      return this.web3.eth.accounts.privateKeyToAccount(secret).address;
    } catch (_e) {
      throw new AuthenticationError({ reason: 'Invalid secret.' });
    }
  }

  public validateSignature(address, signature, data): boolean {
    if (!matchHexOfLength(address, 40)) {
      return false;
    }
    if (!matchHexOfLength(signature, 130)) {
      return false;
    }
    const signer = this.web3.eth.accounts.recover(
      this.serializeForHashing(data),
      signature
    );

    if (address.toLowerCase() !== signer.toLowerCase()) {
      return false;
    }
    return true;
  }

  public serializeForHashing(object) {
    const isDict = subject =>
      typeof subject === 'object' && !Array.isArray(subject);
    const isString = subject => typeof subject === 'string';
    const isArray = subject => Array.isArray(subject);

    if (isDict(object)) {
      const content = Object.keys(object)
        .sort()
        .map(key => `"${key}":${this.serializeForHashing(object[key])}`)
        .join(',');

      return `{${content}}`;
    }
    if (isArray(object)) {
      const content = object
        .map(item => this.serializeForHashing(item))
        .join(',');

      return `[${content}]`;
    }
    if (isString(object)) {
      return `"${object}"`;
    }
    return object.toString();
  }
}
