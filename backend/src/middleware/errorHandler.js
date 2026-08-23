// ============================================================
// ModernTech Central Error Handler
// ============================================================

class ApiError extends Error {

    constructor(
        status,
        message,
        details = null
    ) {

        super(message);

        this.name =
            "ApiError";

        this.status =
            status;

        this.details =
            details;

    }

}


// ============================================================
// ERROR HANDLER
// ============================================================

function errorHandler(
    error,
    req,
    res,
    next
) {

    console.error(
        "Backend error:",
        error
    );


    // --------------------------------------------------------
    // Express validation errors
    // --------------------------------------------------------

    if (
        error.name ===
        "ValidationError"
    ) {

        return res.status(422).json({
            error:
                error.message,

            details:
                error.details || null

        });

    }


    // --------------------------------------------------------
    // Duplicate MySQL record
    // --------------------------------------------------------

    if (
        error.code ===
        "ER_DUP_ENTRY"
    ) {

        return res.status(409).json({
            error:
                "A record with that value already exists."
        });

    }


    // --------------------------------------------------------
    // Foreign key errors
    // --------------------------------------------------------

    if (
        error.code ===
            "ER_NO_REFERENCED_ROW" ||
        error.code ===
            "ER_NO_REFERENCED_ROW_2" ||
        error.code ===
            "ER_ROW_IS_REFERENCED_2"
    ) {

        return res.status(400).json({
            error:
                "The request refers to a record that does not exist or cannot be changed."
        });

    }


    // --------------------------------------------------------
    // CHECK constraint
    // --------------------------------------------------------

    if (
        error.code ===
        "ER_CHECK_CONSTRAINT_VIOLATED"
    ) {

        return res.status(400).json({
            error:
                "The supplied data does not satisfy the database rules."
        });

    }


    // --------------------------------------------------------
    // Explicit ApiError
    // --------------------------------------------------------

    const status =
        Number.isInteger(
            error.status
        )
            ? error.status
            : 500;


    const message =
        status >= 500
            ? "Internal server error"
            : (
                error.message ||
                "Request failed"
            );


    return res.status(status).json({

        error: message,

        ...(error.details
            ? {
                details:
                    error.details
            }
            : {})

    });

}


export {
    ApiError,
    errorHandler
};