import { APIResponseMeta, APIResponse } from '../model';
import { injectable } from 'inversify';

@injectable()
export class BaseController {
  protected handleError(err) {
    const errorResponse = new APIResponse();
    errorResponse.meta = new APIResponseMeta(err.code);
    errorResponse.meta.error = err.name;
    errorResponse.meta.error_message = err.message;
    errorResponse.data = undefined;
    errorResponse.pagination = undefined;
    return errorResponse;
  }
}
