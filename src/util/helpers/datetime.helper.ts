import * as moment from 'moment';

export const isValidDate = date => moment(date).isValid();

export const getTimestamp = () => moment().unix();

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
    .subtract(h, 'h')
    .unix();

export const getTimestampSubDays = d =>
  moment()
    .subtract(d, 'd')
    .unix();

export const getTimestampSubWeeks = w =>
  moment()
    .subtract(w, 'w')
    .unix();
