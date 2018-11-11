import { APIResponseMeta, APIResponse } from '../model';
import { inject, injectable, unmanaged } from 'inversify';
import { ILogger } from '../interface/logger.inferface';
import { MIDDLEWARE, TYPE } from '../constant/types';
@injectable()
export class BaseController {
  constructor(@inject(TYPE.LoggerService) protected logger: ILogger) {}
  protected handleError(err) {
    const meta = new APIResponseMeta(err.code);
    meta.code = err.code;
    meta.error_type = err.name;
    meta.error_message = err.message;

    this.logger.debug(err.stack);

    return new APIResponse(undefined, meta, undefined);
  }
}
