/* tslint:disable */
export const utilSchema = {
    address: {
        "$async": true,
        "title": "Address",
        "type": "object",
        "properties": {
            "address": {
                "type": "string",
                "isAddress": ''
            },
        },
        "additionalProperties": false,
        "required": [
            "address"
        ]
    },
    email: {
        "$async": true,
        "title": "Email",
        "type": "object",
        "properties": {
            "email": {
                "type": "string",
                "pattern": '^([0-9a-zA-Z]([-.\w]*[0-9a-zA-Z])*@(([0-9a-zA-Z])+([-\w]*[0-9a-zA-Z])*\.)+[a-zA-Z]{2,9})$'
            }
        },
        "additionalProperties": false,
        "required": [
            "email"
        ]
    },
    organizationId: {
        "$async": true,
        "title": "Organization Id",
        "type": "object",
        "properties": {
            "organizationId": {
                "type": "integer",
                "minimum": 1
            }
        },
        "additionalProperties": false,
        "required": [
            "organizationId"
        ]
    }
}