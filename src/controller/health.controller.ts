import * as express from 'express';
import { inject } from 'inversify';
import { controller, httpGet, response } from 'inversify-express-utils';

import { TYPE } from '../constant/types';
import { DBClient } from '../database/client';
import { EmailService } from '../service/email.service';

@controller('/health')
export class HealthController {
  constructor(
    @inject(TYPE.DBClient) protected client: DBClient,
    @inject(TYPE.EmailService) private readonly emailService: EmailService
  ) {}

  @httpGet('/')
  public get(@response() res: express.Response) {
    let status = 200;
    if (!this.client.connected) {
      status = 500;
    }

    res.status(status).json({ mongo_connect: this.client.connected });
  }
}
