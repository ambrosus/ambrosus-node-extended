/* tslint:disable */
export const accountCreateSchema = {
  "$async": true,
  "title": "Account",
  "description": "Information about an account",
  "type": "object",
  "properties": {
    "firstName": {
      "description": "Account's first name",
      "type": "string",
      "minLength": 1
    },
    "lastName": {
      "description": "Account's last name",
      "type": "string",
      "minLength": 1
    },
    "email": {
      "description": "Account's email",
      "type": "string",
      "pattern": '^([0-9a-zA-Z]([-.\w]*[0-9a-zA-Z])*@(([0-9a-zA-Z])+([-\w]*[0-9a-zA-Z])*\.)+[a-zA-Z]{2,9})$',
      "isUniqueEmail": ''
    },
    "password": {
      "description": "Account's password",
      "type": "string",
      "pattern": '^((?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,}))'
    },
    "profile": {
      "type": "object",
      "description": "Account's profile information",
      "properties": {
        "picture": {
          "description": "Account's picture",
          "type": "string",
          "minLength": 1
        },
        "description": {
          "description": "Account's description",
          "type": "string",
          "minLength": 1,
          "maxLength": 200
        },
        "background": {
          "description": "App's settings background image",
          "type": "string",
          "format": "uri",
          "minLength": 1
        },
        "color": {
          "description": "App's settings primary color",
          "type": "string",
          "minLength": 1
        }
      },
      "additionalProperties": false
    },
    "disabled": {
      "description": "Account's disabled status",
      "type": "boolean"
    }
  },
  "additionalProperties": false,
  "required": [
    "firstName",
    "lastName",
    "email",
    "password"
  ]
};

export const accounEditSchema = {
  "$async": true,
  "title": "Account",
  "description": "Information about an account",
  "type": "object",
  "properties": {
    "firstName": {
      "description": "Account's first name",
      "type": "string",
      "minLength": 1
    },
    "lastName": {
      "description": "Account's last name",
      "type": "string",
      "minLength": 1
    },
    "email": {
      "description": "Account's email",
      "type": "string",
      "pattern": '^([0-9a-zA-Z]([-.\w]*[0-9a-zA-Z])*@(([0-9a-zA-Z])+([-\w]*[0-9a-zA-Z])*\.)+[a-zA-Z]{2,9})$',
      "isUniqueEmail": ''
    },
    "password": {
      "description": "Account's password",
      "type": "string",
      "pattern": '^((?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,}))'
    },
    "profile": {
      "type": "object",
      "description": "Account's profile information",
      "properties": {
        "picture": {
          "description": "Account's picture",
          "type": "string",
          "minLength": 1
        },
        "description": {
          "description": "Account's description",
          "type": "string",
          "minLength": 1,
          "maxLength": 200
        },
        "background": {
          "description": "App's settings background image",
          "type": "string",
          "format": "uri",
          "minLength": 1
        },
        "color": {
          "description": "App's settings primary color",
          "type": "string",
          "minLength": 1
        }
      },
      "additionalProperties": false
    },
    "disabled": {
      "description": "Account's disabled status",
      "type": "boolean"
    }
  },
  "additionalProperties": false
};
