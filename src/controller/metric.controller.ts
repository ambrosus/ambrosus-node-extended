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
      'https://api.coinmarketcap.com/v1/ticker/amber/'
    );
    return amb.data[0];
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
}
