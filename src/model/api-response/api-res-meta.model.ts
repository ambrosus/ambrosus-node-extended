import { injectable } from 'inversify';

export interface IAPIResponseMeta {
  code: number;
  count: number;
  exists: boolean;
  error_type: string;
  error_message: string;
}

@injectable()
export class APIResponseMeta implements IAPIResponseMeta {
  public code: number;
  public count: number;
  public exists: boolean;
  public error_type: string;
  public error_message: string;

  constructor(_code?: number) {
    this.code = _code;
  }
}
