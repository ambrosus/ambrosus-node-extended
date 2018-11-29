/* tslint:disable */
export const todoCreateSchema = {
  "$async": true,
  "title": "Todo",
  "description": "Information about a todo",
  "type": "object",
  "properties": {
    "title": {
      "description": "Todo's title",
      "type": "string",
      "minLength": 1,
      "maxLength": 255
    },
    "description": {
      "description": "Todo's description",
      "type": "string",
      "minLength": 1,
      "maxLength": 5000
    },
    "list": {
      "description": "List reference",
      "type": "string",
      "minLength": 1,
      "isObjectId": ''
    },
    "dueDate": {
      "description": "Todo's due date",
      "type": "string",
      "format": "date"
    },
    "repeat": {
      "type": "object",
      "description": "Todo's repeat information",
      "properties": {
        "every": {
          "description": "Repeats every how often",
          "type": "integer"
        },
        "type": {
          "description": "Every what",
          "type": "string",
          "enum": ['days', 'weeks', 'years']
        }
      },
      "additionalProperties": false,
      "required": [
        "every",
        "type"
      ]
    },
    "completed": {
      "description": "Todo's completed status",
      "type": "boolean"
    }
  },
  "additionalProperties": false,
  "required": [
    "title",
  ]
};

export const todoEditSchema = {
  "$async": true,
  "title": "Todo",
  "description": "Information about a todo",
  "type": "object",
  "properties": {
    "title": {
      "description": "Todo's title",
      "type": "string",
      "minLength": 1,
      "maxLength": 255
    },
    "description": {
      "description": "Todo's description",
      "type": "string",
      "minLength": 1,
      "maxLength": 5000
    },
    "list": {
      "description": "List reference",
      "type": "string",
      "minLength": 1,
      "isObjectId": ''
    },
    "dueDate": {
      "description": "Todo's due date",
      "type": "string",
      "format": "date"
    },
    "repeat": {
      "type": "object",
      "description": "Todo's repeat information",
      "properties": {
        "every": {
          "description": "Repeats every how often",
          "type": "integer"
        },
        "type": {
          "description": "Every what",
          "type": "string",
          "enum": ['days', 'weeks', 'years']
        }
      },
      "additionalProperties": false,
      "required": [
        "every",
        "type"
      ]
    },
    "completed": {
      "description": "Todo's completed status",
      "type": "boolean"
    }
  },
  "additionalProperties": false
};
