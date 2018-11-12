import { AmbrosusError } from './ambrosus.error';

export class PermissionError extends AmbrosusError {
  constructor() {
    super('Your account has insufficient permissions to perform this task.', 403);
  }
}
