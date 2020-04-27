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

import { config } from '../config';
import { TYPE } from '../constant/types';

import { Request } from 'express';

import {
  injectable,
  inject
} from 'inversify';

import { ILogger } from '../interface/logger.inferface';

import {
  Throttling,
  APIQuery
} from '../model';

import { ThrottlingRepository } from '../database/repository';
import { getTimestamp } from '../util';
import { StringWriteStream } from '../database/string_write_stream';

@injectable()
export class ThrottlingService {
  constructor(
    @inject(TYPE.LoggerService) protected logger: ILogger,
    @inject(TYPE.ThrottlingRepository) private throttlingRepository: ThrottlingRepository
  ) {
  }

  public update = async (address: string, item: string) => {
    let throttling = await this.get(address);

    if (throttling === undefined) {
      throttling = new Throttling;

      throttling.address = address;

      this.throttlingRepository.create(throttling);
    }

    if (throttling[item] === undefined) {
      throttling[item] = { count: 0, last: 0 };
    }

    throttling[item].count = throttling[item].count + 1;
    throttling[item].last = getTimestamp();

    this.throttlingRepository.update(new APIQuery( { address: throttling.address } ), throttling);
  }

  public check = async (address: string, item: string) => {
    const throttling = await this.get(address);

    if ((throttling === undefined) || (throttling[item] === undefined)) {
      return 0;
    }

    const diff = (getTimestamp() - throttling[item].last);

    const interval = config.test.intervals[item] + config.test.intervals[item] * (throttling[item].count - 1) * 0.25;

    return (interval - diff);
  }

  public addressFromRequest = (req: Request): string => {
    let result = req.headers['cf-connecting-ip'];

    if (result !== undefined) {
      return String(result);
    }

    result = req.connection.remoteAddress;

    return result;
  }

  private get = async (address: string): Promise<Throttling> => {
    return this.throttlingRepository.findOne(new APIQuery( { address } ));
  }
}
