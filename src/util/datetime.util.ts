import * as moment from 'moment';

export const isValidDate = date => moment(date).isValid();

export const getTimestamp = () => moment().unix();

export const timestampToDateString = ts => moment.unix(ts).format('MMMM Do YYYY, h:mm:ss a');

export const getTimestampMonthStart = () =>
  moment()
    .startOf('M')
    .unix();

export const getTimestampDateStart = date =>
  moment(date)
    .startOf('d')
    .unix();

export const getTimestampDateEnd = date =>
  moment(date)
    .endOf('d')
    .unix();

export const getTimestampSubHours = h =>
  moment()
    .subtract(h, 'hours')
    .unix();

export const getTimestampSubDays = d =>
  moment()
    .subtract(d, 'days')
    .unix();

export const getTimestampSubWeeks = w =>
  moment()
    .subtract(w, 'weeks')
    .unix();

export const getTimestampAddDays = d =>
  moment()
    .add(d, 'days')
    .unix();

export const parseAnalytics = (array: any[], start, end, group: string) => {
  let results = [];
  const format: any = (add = true) => {
    switch (group) {
      case 'hour':
        return add ? 'hours' : 'Y-MM-DD-HH';
      case 'month':
        return add ? 'months' : 'Y-MM';
      case 'year':
        return add ? 'years' : 'Y';
      default:
        return add ? 'days' : 'Y-MM-DD';
    }
  };

  try {
    let point: any = moment(start * 1000).unix();

    while (point <= +end) {
      results.push({
        timestamp: point,
        count: 0,
      });

      point = moment(point * 1000).add(1, format()).unix();
    }

    results.map(stat => {
      const dbStat = array.find(_dbStat => moment(stat.timestamp * 1000).format(format(false)) === _dbStat.timestamp);
      stat.count = dbStat ? dbStat.count : 0;
    });

  } catch (error) {
    console.error(error);
    results = array;
  }

  return results;
};
