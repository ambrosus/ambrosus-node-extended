import * as express from 'express';
import { controller, httpGet, response } from 'inversify-express-utils';
import * as Prometheus from 'prom-client';

@controller('/metrics')
export class MetricController {

  constructor() {
    Prometheus.collectDefaultMetrics({ timeout: 10000 });
  }

  @httpGet('/')
  public get(@response() res: express.Response) {
    res.set('Content-Type', Prometheus.register.contentType);
    res.end(Prometheus.register.metrics());
  }
}
