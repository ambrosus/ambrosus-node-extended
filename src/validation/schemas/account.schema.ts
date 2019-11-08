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

import { Permission } from '../../constant/';

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
                "pattern": '^([0-9a-zA-Z]([-.+\\w]*[0-9a-zA-Z])*@(([0-9a-zA-Z])+([-\\w]*[0-9a-zA-Z])*\\.)+[a-zA-Z]{2,9})$'
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
            }
        },
        "additionalProperties": false,
        "required": [
            "address"
        ]
    },
    accountCreate: {
        "$async": true,
        "title": "Account create",
        "type": "object",
        "properties": {            
            "address": {
                "type": "string",
                "isAddress": ''
            },
            "fullName": {
                "type": "string",
                "minLength": 2,
                "maxLength": 100
            },
            "accessLevel": {
                "type": "integer",
                "minimum": 0,
                "maximum": 1000
            },
            "email": {
                "type": "string",
                "pattern": '^([0-9a-zA-Z]([-.+\\w]*[0-9a-zA-Z])*@(([0-9a-zA-Z])+([-\\w]*[0-9a-zA-Z])*\\.)+[a-zA-Z]{2,9})$'
            },
            "permissions": {
                "type": "array",
                "uniqueItems": true,
                "items": {
                    "type": "string"
                }
        },

        },
        "additionalProperties": false,
        "required": [
            "address", "email"
        ]
    }
}