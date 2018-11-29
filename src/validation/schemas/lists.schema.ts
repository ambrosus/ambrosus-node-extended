/* tslint:disable */
export const listCreateSchema = {
  "$async": true,
  "title": "List",
  "description": "Information about a list",
  "type": "object",
  "properties": {
    "title": {
      "description": "List's title",
      "type": "string",
      "minLength": 1,
      "maxLength": 30
    },
  },
  "additionalProperties": false,
  "required": [
    "title"
  ]
};

export const listEditSchema = {
  "$async": true,
  "title": "List",
  "description": "Information about a list",
  "type": "object",
  "properties": {
    "title": {
      "description": "List's title",
      "type": "string",
      "minLength": 1,
      "maxLength": 30
    }
  },
  "additionalProperties": false
};
