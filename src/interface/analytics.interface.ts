export interface IAnalytics {
    getCount();
    getCountByMonthToDate();
    getCountByDate(date: string);
    getCountByDateRange(start: string, end: string);
    getCountByRollingHours(hours: number);
    getCountByRollingDays(days: number);
  }
