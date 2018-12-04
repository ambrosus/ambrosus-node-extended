import { AmbrosusError } from './ambrosus.error';

export class PermissionError extends AmbrosusError {
  constructor(error, message = '') {
    super(error, `Permission denied:`);
    this.name = 'PermissionError';
  }
}
