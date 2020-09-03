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

import axios from 'axios';
import * as express from 'express';
import { controller, httpGet, response } from 'inversify-express-utils';
import * as Prometheus from 'prom-client';
import { inject } from 'inversify';
import { MIDDLEWARE, TYPE } from '../constant/types';
import { authorize } from '../middleware/authorize.middleware';
import { Web3Service } from '../service/web3.service';

@controller('/metrics', MIDDLEWARE.Context)
export class MetricController {
  constructor(@inject(TYPE.Web3Service) private web3Service: Web3Service) {
    Prometheus.collectDefaultMetrics({ timeout: 10000 });
  }

  @httpGet('/')
  public get(@response() res: express.Response) {
    res.set('Content-Type', Prometheus.register.contentType);
    res.end(Prometheus.register.metrics());
  }

  @httpGet('/amb', authorize('super_account'))
  public async getAmb() {
    const amb = await axios.get(
      'https://token.ambrosus.io/'
    );
    return amb.data.data || {};
  }

  @httpGet('/bundle', authorize('super_account'))
  public async getBundle() {
    const bundleInfo = {
      price: 12.0,
    };
    return bundleInfo;
  }

  @httpGet('/balance', authorize('super_account'))
  public async getBalance() {
    const balance = await this.web3Service.getBalance();
    return { balance };
  }

  @httpGet('/forceError')
  public async forceError() {
    throw new Error('Forced error');
  }
}
