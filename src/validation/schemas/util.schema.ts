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
        "required": [
            "address"
        ]
    },
    collection: {
        "$async": true,
        "title": "Collection",
        "type": "object",
        "properties": {
            "collection": {
                "type": "string",
                "enum": ["asset", "event", "bundle", "account"]
            },
        },
        "required": [
            "collection"
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
        "required": [
            "organizationId"
        ]
    }
}