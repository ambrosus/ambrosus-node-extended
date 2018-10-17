import { AmbrosusError } from './ambrosus.error';

export class ValidationError extends AmbrosusError {
  constructor(message) {
    super(`Invalid data: ${message}`);
  }
}
