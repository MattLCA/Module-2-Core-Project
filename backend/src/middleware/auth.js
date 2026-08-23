// ============================================================
// ModernTech Authentication Middleware
// ============================================================
//
// Responsibilities:
//
// 1. Read the JWT from:
//      Authorization: Bearer <token>
//
// 2. Verify the JWT.
//
// 3. Store the decoded user information in:
//      req.user
//
// 4. Provide role-based access control using:
//      authorize("hr")
//      authorize("worker")
// ============================================================

import jwt from "jsonwebtoken";


// ============================================================
// AUTHENTICATE
// ============================================================
//
// This checks whether a valid JWT was supplied.
//
// If successful:
//
// req.user = {
//     employeeId,
//     employeeCode,
//     role,
//     name,
//     ...
// }
//
// ============================================================

function authenticate(req, res, next) {

    const authorizationHeader =
        req.headers.authorization || "";


    // --------------------------------------------------------
    // Check Authorization header
    // --------------------------------------------------------

    const parts =
        authorizationHeader.split(" ");

    const scheme =
        parts[0];

    const token =
        parts[1];


    if (
        scheme !== "Bearer" ||
        !token
    ) {

        return res.status(401).json({
            error: "Missing or malformed Authorization header"
        });

    }


    // --------------------------------------------------------
    // Verify JWT
    // --------------------------------------------------------

    try {

        const payload =
            jwt.verify(
                token,
                process.env.JWT_SECRET
            );


        // Store the decoded token for controllers
        // and other middleware to use.

        req.user =
            payload;


        return next();

    } catch (error) {

        console.error(
            "JWT authentication error:",
            error
        );


        // Token has expired.

        if (
            error.name ===
            "TokenExpiredError"
        ) {

            return res.status(401).json({
                error: "Token expired"
            });

        }


        // Token is invalid.

        return res.status(401).json({
            error: "Invalid token"
        });

    }

}


// ============================================================
// AUTHORIZE
// ============================================================
//
// Example:
//
// router.get(
//     "/employees",
//     authenticate,
//     authorize("hr"),
//     controller.list
// );
//
// Multiple roles are supported:
//
// authorize("hr", "worker")
//
// ============================================================

function authorize(
    ...allowedRoles
) {

    return (
        req,
        res,
        next
    ) => {

        // ----------------------------------------------------
        // Authentication must happen first.
        // ----------------------------------------------------

        if (!req.user) {

            return res.status(401).json({
                error: "Not authenticated"
            });

        }


        // ----------------------------------------------------
        // No roles supplied
        //
        // If you use authorize() with no arguments,
        // the route still requires authentication but does
        // not restrict the user's role.
        // ----------------------------------------------------

        if (
            allowedRoles.length === 0
        ) {

            return next();

        }


        // ----------------------------------------------------
        // Check role
        // ----------------------------------------------------

        if (
            !allowedRoles.includes(
                req.user.role
            )
        ) {

            return res.status(403).json({
                error: "Insufficient permissions"
            });

        }


        return next();

    };

}


export {
    authenticate,
    authorize
};