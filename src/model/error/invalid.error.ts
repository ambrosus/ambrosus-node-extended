import { AmbrosusError } from './ambrosus.error';

export class InvalidError extends AmbrosusError {
  constructor(message) {
    super(`Invalid: ${message}`, 400);
  }
}
