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

import { Request } from 'express';
import * as HttpStatus from 'http-status-codes';
import { inject } from 'inversify';
import {
    controller,
    httpPost,
} from 'inversify-express-utils';

import { MIDDLEWARE, TYPE } from '../constant/types';
import { ILogger } from '../interface/logger.inferface';
import { APIResponse, APIResponseMeta } from '../model';
import { BaseController } from './base.controller';
import { authorize } from '../middleware/authorize.middleware';
import { MobileService } from '../service/mobile.service';

@controller(
    '/mobile',
    MIDDLEWARE.Context,
    authorize()
)
export class MobileController extends BaseController {

    constructor(
        @inject(TYPE.MobileService) private mobileService: MobileService,
        @inject(TYPE.LoggerService) protected logger: ILogger
    ) {
        super(logger);
    }

    @httpPost(
        '/'
    )
    public async sendMessage(req: Request): Promise<APIResponse> {
        const { to, message }: any = req.body;
        const response = await this.mobileService.sendMessage(to, message);
        const meta = new APIResponseMeta(HttpStatus.CREATED, response);

        return APIResponse.withMeta(meta);
    }
}
