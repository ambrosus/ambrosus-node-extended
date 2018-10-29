export interface IAPIPagination {
  limit: number;
  next: string;
  previous: string;
  paginationField: string;
  sortAscending: boolean;
}

export class APIPagination implements IAPIPagination {
  public limit: number;
  public next: string;
  public previous: string;
  public paginationField: string;
  public sortAscending: boolean;
}
