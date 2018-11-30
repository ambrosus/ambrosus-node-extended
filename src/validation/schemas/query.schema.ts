/* tslint:disable */
export const querySchema = {
    "$async": true,
    "title": "Query schema",
    "type": "object",
    "properties": {
        "query": {
            "type": "array",
            "uniqueItems": true,
            "items": {
                "type": "object"
            }
        },
        "limit": {
            "type": "integer",
            "minimum": 1
        },
        "next": {
            "type": "string",
            "isBase64": ''
        },
        "previous": {
            "type": "string",
            "isBase64": ''
        }
    }
}