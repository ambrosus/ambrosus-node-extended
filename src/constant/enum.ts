/*
 * Copyright: Ambrosus Inc.
 * Email: tech@ambrosus.io
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files
 * (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

export enum Permission {
  super_account = 'super_account',
  register_accounts = 'register_accounts',
  manage_accounts = 'manage_accounts',
  create_asset = 'create_asset',
  create_event = 'create_event',
}

export enum Authorization {
  organization_owner = 'organization_owner',
}

export enum TimeSeriesGroupBy {
  HOUR = '%Y-%m-%d-%H',
  DAY = '%Y-%m-%d',
  MONTH = '%Y-%m',
  YEAR = '%Y',
}

export const timeSeriesGroupFromString = s => {
  if (!s) {
    return TimeSeriesGroupBy.DAY;
  }
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
      return TimeSeriesGroupBy.DAY;
    }
  }
};
