/* tslint:disable */
export const accountSchema = {
    accountDetails: {
        "$async": true,
        "title": "Account details",
        "type": "object",
        "properties": {
            "fullName": {
                "type": "string",
                "minLength": 2,
                "maxLength": 100
            },
            "email": {
                "type": "string",
                "pattern": '^([0-9a-zA-Z]([-.\w]*[0-9a-zA-Z])*@(([0-9a-zA-Z])+([-\w]*[0-9a-zA-Z])*\.)+[a-zA-Z]{2,9})$'
            },
            "token": {
                "type": "string",
                "isBase64": ''
            },
            "timeZone": {
                "type": "string",
                "minLength": 3,
                "maxLength": 50
            },
            "address": {
                "type": "string",
                "isAddress": ''
            },
            "password": {
                "type": "string",
                "pattern": '^((?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,}))'
            }
        },
        "additionalProperties": false
    }
}