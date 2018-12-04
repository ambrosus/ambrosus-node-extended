export enum Permission {
  super_account = 'super_account',
  register_accounts = 'register_accounts',
  manage_accounts = 'manage_accounts',
  create_asset = 'create_asset',
  create_event = 'create_event',
}

export enum TimeSeriesGroupBy {
  HOUR = '%Y-%m-%d-%H',
  DAY = '%Y-%m-%d',
  MONTH = '%Y-%m',
  YEAR = '%Y',
}

export const timeSeriesGroupFromString = s => {
  switch (s.toLowerCase()) {
    case 'hour': {
      return TimeSeriesGroupBy.HOUR;
    }
    case 'day': {
      return TimeSeriesGroupBy.DAY;
    }
    case 'month': {
      return TimeSeriesGroupBy.MONTH;
    }
    case 'year': {
      return TimeSeriesGroupBy.YEAR;
    }
    default: {
      return undefined;
    }
  }
};
