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
