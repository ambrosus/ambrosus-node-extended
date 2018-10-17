import { ValidationError } from './validation.error';

export class JsonValidationError extends ValidationError {
  private errors;
  constructor(errors) {
    const messageForError = err => {
      if (err.dataPath) {
        return `${err.dataPath} ${err.message}`;
      }
      return err.message;
    };

    super(errors.map(err => messageForError(err)).join(', '));
    this.errors = errors;
  }
}
