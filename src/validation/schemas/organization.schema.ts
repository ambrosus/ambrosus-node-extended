/* tslint:disable */
export const organizationSchema = {
    organizationInvites: {
        "$async": true,
        "title": "Organization invite",
        "type": "object",
        "properties": {
            "email": {
                "type": "array",
                "maxItems": 10,
                "uniqueItems": true,
                "items": {
                    "type": "string",
                    "pattern": '^([0-9a-zA-Z]([-.\w]*[0-9a-zA-Z])*@(([0-9a-zA-Z])+([-\w]*[0-9a-zA-Z])*\.)+[a-zA-Z]{2,9})$'
                }
            }
        },
        "additionalProperties": false
    },
    organizationRequest: {
        "$async": true,
        "title": "Organization request",
        "type": "object",
        "properties": {
            "title": {
                "type": "string",
                "minLength": 2,
                "maxLength": 100
            },
            "address": {
                "type": "string",
                "isAddress": ''
            },
            "email": {
                "type": "string",
                "pattern": '^([0-9a-zA-Z]([-.\w]*[0-9a-zA-Z])*@(([0-9a-zA-Z])+([-\w]*[0-9a-zA-Z])*\.)+[a-zA-Z]{2,9})$'
            },
            "message": {
                "type": "string",
                "minLength": 2,
                "maxLength": 1024
            }
        },
        "additionalProperties": false,
        "required": [
            "address",
            "email"
        ]
    }
}