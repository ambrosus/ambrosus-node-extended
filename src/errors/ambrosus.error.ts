export class AmbrosusError extends Error {
  public error: Error;

  constructor(error, message = 'Error: ') {
    super(message);
    this.name = 'AmbrosusError';
    this.error = error || null;
    this.stack = (new Error(message)).stack;
  }
}
