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

import { inject } from 'inversify';
import {
  controller,
  httpGet
} from 'inversify-express-utils';

import { config } from '../config';
import { MIDDLEWARE, TYPE } from '../constant/types';
import { ILogger } from '../interface/logger.inferface';
import { APIResponse } from '../model';
import { Web3Service } from '../service/web3.service';
import { BaseController } from './base.controller';
import { WorkerLogsRepository } from '../database/repository';

import * as pack from '../../package.json';

@controller(
  '/nodeinfo',
  MIDDLEWARE.Context
)
export class NodeinfoController extends BaseController {
  constructor(
    @inject(TYPE.Web3Service) private web3Service: Web3Service,
    @inject(TYPE.LoggerService) protected logger: ILogger
    // @inject(TYPE.WorkersLogsRepository) private workerlogsRepository: WorkerLogsRepository
  ) {
    super(logger);
  }

  @httpGet(
    '/'
  )
  public async getNodeinfo(): Promise<APIResponse> {
    const nodeAddress = this.web3Service.addressFromSecret(config.web3.privateKey);
    // const workerLogs = this.workerlogsRepository.getLogs(5);

    const result = {
      nodeAddress,
      commit: config.gitCommit,
      version: pack.version,
      // workerLogs: workerLogs
    };

    return APIResponse.fromSingleResult(result);
  }
}
