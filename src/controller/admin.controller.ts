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

import { inject } from 'inversify';
import {
  controller,
  httpGet,
  httpPost,
  requestBody,
} from 'inversify-express-utils';

import { MIDDLEWARE, TYPE } from '../constant/types';
import { APIResponse, ConfigData } from '../model';
import { ILogger } from '../interface/logger.inferface';
import { BaseController } from './base.controller';
import { AdminService } from '../service/admin.service';
import { authorize } from '../middleware/authorize.middleware';

@controller(
  '/admin',
  MIDDLEWARE.Context,
  authorize('super_account')
)
export class AdminController extends BaseController {

  constructor(
    @inject(TYPE.AdminService) private adminService: AdminService,
    @inject(TYPE.LoggerService) protected logger: ILogger
  ) {
    super(logger);
  }

  @httpGet(
    '/pushbundle'
  )
  public async pushBundles(): Promise<APIResponse> {
    await this.adminService.pushBundle();

    return APIResponse.fromSingleResult('OK');
  }

  @httpGet(
    '/getconfig'
  )
  public async getConfig(): Promise<APIResponse> {
    const configData = await this.adminService.getConfig();

    return APIResponse.fromSingleResult(configData);
  }

  @httpPost(
    '/restoreconfig'
  )
  public async restoreConfig(
    @requestBody() payload: ConfigData
  ): Promise<APIResponse> {
    await this.adminService.restoreConfig(payload);

    return APIResponse.fromSingleResult('OK');
  }
}
