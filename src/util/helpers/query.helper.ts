import * as _ from 'lodash';

export const matchMongoOperator = operator => {
  if (operator === 'equal') {
    return '$eq';
  }

  if (operator === 'not-equal') {
    return '$ne';
  }

  if (operator === 'equal-array') {
    return '$in';
  }

  if (operator === 'not-equal-array') {
    return '$nin';
  }

  if (operator === 'greater-than') {
    return '$gt';
  }

  if (operator === 'greater-than-equal') {
    return '$gte';
  }

  if (operator === 'less-than') {
    return '$lt';
  }

  if (operator === 'less-than-equal') {
    return '$lte';
  }

  if (operator === 'inrange') {
    return '$range';
  }

  return undefined;
};

export const parseAPIQuery = q => {
  return _.reduce(
    q,
    (result, filter) => {
      const field = filter.field;
      const op = filter.operator;
      const val = filter.value;

      if (!result[field]) {
        result[field] = {};
      }

      if (Array.isArray(val) && (op === 'equal' || op === 'not-equal')) {
        result[field][matchMongoOperator(`${op}-array`)] = val;
      } else if (op === 'inrange') {
        // TODO: Validate we have exactly 2 operators for inrange '<' '>'
        const opA = matchMongoOperator(Object.keys(val)[0]);
        const opB = matchMongoOperator(Object.keys(val)[1]);
        result[field][opA] = val[Object.keys(val)[0]];
        result[field][opB] = val[Object.keys(val)[1]];
      } else {
        result[field][matchMongoOperator(op)] = val;
      }
      return result;
    },
    {}
  );
};
