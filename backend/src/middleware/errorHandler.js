// ============================================================
// ModernTech Central Error Handler
// ============================================================
//
// This file gives the entire backend one consistent way of
// returning errors.
//
// Controllers can:
//
//     throw new ApiError(404, "Employee not found");
//
// or:
//
//     next(error);
//
// The errorHandler then formats the response.
// ============================================================


// ============================================================
// API ERROR
// ============================================================

class ApiError extends Error {

    constructor(
        status,
        message
    ) {

        super(message);

        this.name =
            "ApiError";

        this.status =
            status;

    }

}


// ============================================================
// ERROR HANDLER
// ============================================================

function errorHandler(
    err,
    req,
    res,
    next
) {

    console.error(
        "Backend error:",
        err
    );


    // --------------------------------------------------------
    // Duplicate database value
    //
    // Examples:
    // - duplicate email
    // - duplicate employee code
    // - duplicate payroll period
    // --------------------------------------------------------

    if (
        err.code ===
        "ER_DUP_ENTRY"
    ) {

        return res.status(409).json({
            error:
                "A record with that value already exists"
        });

    }


    // --------------------------------------------------------
    // Foreign key violation
    // --------------------------------------------------------

    if (
        err.code ===
            "ER_NO_REFERENCED_ROW" ||
        err.code ===
            "ER_NO_REFERENCED_ROW_2" ||
        err.code ===
            "ER_ROW_IS_REFERENCED_2"
    ) {

        return res.status(400).json({
            error:
                "The request refers to a record that does not exist or cannot be changed"
        });

    }


    // --------------------------------------------------------
    // MySQL validation / constraint errors
    // --------------------------------------------------------

    if (
        err.code ===
        "ER_CHECK_CONSTRAINT_VIOLATED"
    ) {

        return res.status(400).json({
            error:
                "The supplied data does not satisfy the database rules"
        });

    }


    // --------------------------------------------------------
    // Explicit API error
    // --------------------------------------------------------

    const status =
        Number.isInteger(err.status)
            ? err.status
            : 500;


    // --------------------------------------------------------
    // Never expose internal server details to the frontend.
    // --------------------------------------------------------

    const message =
        status >= 500
            ? "Internal server error"
            : (
                err.message ||
                "Request failed"
            );


    return res.status(status).json({
        error: message
    });

}


export {
    errorHandler,
    ApiError
};