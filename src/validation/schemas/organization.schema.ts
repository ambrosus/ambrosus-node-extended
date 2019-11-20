/*
 * Copyright: Ambrosus Inc.
 * Email: tech@ambrosus.com
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files
 * (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

/* tslint:disable */
export const organizationSchema = {
    organizationCreate: {
        "$async": true,
        "title": "Organization create",
        "type": "object",
        "properties": {
            "owner": {
                "type": "string",
                "isAddress": ''
            },
            "title": {
                "type": "string",
                "minLength": 2,
                "maxLength": 100
            },
            "timeZone": {
                "type": "string",
                "minLength": 3,
                "maxLength": 50
            },
            "active": {
                "type": "boolean"
            },
            "legalAddress": {
                "type": "string",
                "minLength": 2,
                "maxLength": 255
            },
            "logo": {
                "type": "string",
            },
            "colorPrimary": {
                "type": "string",
            },
            "colorSecondary": {
                "type": "string",
            },
        },
        "additionalProperties": false,
        "required": [
            "owner",
            "active"
        ]
    },
    organizationUpdate: {
        "$async": true,
        "title": "Organization update",
        "type": "object",
        "properties": {
            "owner": {
                "type": "string",
                "isAddress": ''
            },
            "title": {
                "type": "string",
                "minLength": 2,
                "maxLength": 100
            },
            "timeZone": {
                "type": "string",
                "minLength": 3,
                "maxLength": 50
            },
            "active": {
                "type": "boolean"
            },
            "legalAddress": {
                "type": "string",
                "minLength": 2,
                "maxLength": 255
            },
            "organizationId": {
                "type": "integer",
                "minimum": 1
            },
            "logo": {
                "type": "string",
            },
            "colorPrimary": {
                "type": "string",
            },
            "colorSecondary": {
                "type": "string",
            },
            "inviteEmail": {
                "type": "string",
                "pattern": '^([0-9a-zA-Z]([-.+\\w]*[0-9a-zA-Z])*@(([0-9a-zA-Z])+([-\\w]*[0-9a-zA-Z])*\\.)+[a-zA-Z]{2,9})$'
            },
            "inviteTemplateId": {
                "type": "string"
            },
        },
        "additionalProperties": false,
        "required": [
            "organizationId"
        ]
    },
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
                    "pattern": '^([0-9a-zA-Z]([-.+\\w]*[0-9a-zA-Z])*@(([0-9a-zA-Z])+([-\\w]*[0-9a-zA-Z])*\\.)+[a-zA-Z]{2,9})$'
                }
            }
        },
        "additionalProperties": false,
        "required": [
            "email"
        ]
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
                "pattern": '^([0-9a-zA-Z]([-.+\\w]*[0-9a-zA-Z])*@(([0-9a-zA-Z])+([-\\w]*[0-9a-zA-Z])*\\.)+[a-zA-Z]{2,9})$'
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