import { ApiError } from "../utils/api.error.js";
import logger from "../utils/logger.js";
export default (err, req, res, next) => {
    if (res.headerSent)
        return next(err);
    if (err instanceof ApiError) {
        return res.status(err.statusCode).json({
            message: err.message,
        });
    }
    logger.error({ err });
    return res.status(500).json({
        message: "Internal server error.",
    });
};
//# sourceMappingURL=error.middleware.js.map