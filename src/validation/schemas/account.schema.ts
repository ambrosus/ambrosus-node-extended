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
                "format": "email"
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
            "password": {
                "type": "string",
                "pattern": '^((?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,}))'
            },
            "address": {
                "type": "string",
                "isAddress": ''
            }
        },
        "additionalProperties": false,
        "required": [
            "address"
        ]
    }
}