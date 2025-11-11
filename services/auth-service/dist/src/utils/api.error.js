export class ApiError extends Error {
    statusCode;
    message;
    constructor(statusCode, message = "Something went wrong.") {
        if (!statusCode || !Number.isInteger(statusCode))
            throw new Error("ApiError requires an integer statusCode");
        super(message);
        this.statusCode = statusCode;
        this.message = message;
    }
}
//# sourceMappingURL=api.error.js.map