import { AmbrosusError } from './ambrosus.error';

export class NotFoundError extends AmbrosusError {
  constructor(error, message = '') {
    super(error, `Not found:`);
    this.name = 'NotFoundError';
  }
}
