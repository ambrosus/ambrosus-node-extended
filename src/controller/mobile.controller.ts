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
        const { to, message }: any = req;
        const response = await this.mobileService.sendMessage(to, message);
        const meta = new APIResponseMeta(HttpStatus.CREATED, response);

        return APIResponse.withMeta(meta);
    }
}
