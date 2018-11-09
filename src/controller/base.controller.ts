import { APIResponseMeta, APIResponse } from '../model';
import { injectable } from 'inversify';

@injectable()
export class BaseController {
  protected handleError(err) {
    const meta = new APIResponseMeta();
    meta.code = err.code;
    meta.error_type = err.name;
    meta.error_message = err.message;

    return new APIResponse(undefined, meta, undefined);
  }
}
