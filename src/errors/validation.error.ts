import { AmbrosusError } from './ambrosus.error';

export class ValidationError extends AmbrosusError {
  constructor(error, message = '') {
    super(error, `Invalid data:`);
    this.name = 'ValidationError';
  }
}
