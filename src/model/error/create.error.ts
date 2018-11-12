import { AmbrosusError } from './ambrosus.error';

export class CreateError extends AmbrosusError {
  constructor(message) {
    super(`Unable to create: ${message}`, 400);
  }
}
