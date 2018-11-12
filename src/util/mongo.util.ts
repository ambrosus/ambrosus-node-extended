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

  if (operator === 'startsWith' || operator === 'contains') {
    return '$regex';
  }

  return undefined;
};

export const validateOperators = q => {
  const errors = [];
  _.forEach(q, filter => {
    if (
      !filter.hasOwnProperty('field') ||
      !filter.hasOwnProperty('operator') ||
      !filter.hasOwnProperty('value')
    ) {
      errors.push(`Invalid query object ${filter}`);
    } else {
      const op = filter.operator;
      if (!matchMongoOperator(op)) {
        errors.push(`Invalid query operator: ${op}`);
      }
    }
  });
  return errors;
};

export const getMongoFilter = q => {
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
      } else if (op === 'startsWith') {
        result[field][matchMongoOperator(op)] = `(?i)^${val}`;
      } else if (op === 'contains') {
        result[field][matchMongoOperator(op)] = `(?i).*${val}.*`;
      } else {
        result[field][matchMongoOperator(op)] = val;
      }
      return result;
    },
    {}
  );
};
