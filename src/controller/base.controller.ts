import { inject, injectable } from 'inversify';

import { TYPE } from '../constant/types';
import { ILogger } from '../interface/logger.inferface';

@injectable()
export class BaseController {

  constructor(@inject(TYPE.LoggerService) protected logger: ILogger) { }

}
