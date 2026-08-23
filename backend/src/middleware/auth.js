// ============================================================
// ModernTech Authentication Middleware
// ============================================================

import jwt from "jsonwebtoken";


// ============================================================
// AUTHENTICATE
// ============================================================
//
// Reads:
//
// Authorization: Bearer <token>
//
// Then places the decoded JWT inside:
//
// req.user
//
// ============================================================

function authenticate(req, res, next) {

    const authorization =
        req.headers.authorization || "";


    const [scheme, token] =
        authorization.split(" ");


    if (
        scheme !== "Bearer" ||
        !token
    ) {

        return res.status(401).json({
            error:
                "Missing or malformed Authorization header"
        });

    }


    if (!process.env.JWT_SECRET) {

        console.error(
            "JWT_SECRET is not configured."
        );

        return res.status(500).json({
            error:
                "Authentication is not configured correctly."
        });

    }


    try {

        const payload =
            jwt.verify(
                token,
                process.env.JWT_SECRET
            );


        req.user = payload;


        return next();

    } catch (error) {

        console.error(
            "JWT authentication error:",
            error.message
        );


        if (
            error.name ===
            "TokenExpiredError"
        ) {

            return res.status(401).json({
                error: "Token expired"
            });

        }


        return res.status(401).json({
            error: "Invalid token"
        });

    }

}


// ============================================================
// AUTHORIZE
// ============================================================
//
// Examples:
//
// authorize("hr")
//
// authorize("worker")
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

        if (!req.user) {

            return res.status(401).json({
                error:
                    "Not authenticated"
            });

        }


        // If no roles were supplied,
        // authentication alone is required.

        if (
            allowedRoles.length === 0
        ) {

            return next();

        }


        if (
            !allowedRoles.includes(
                req.user.role
            )
        ) {

            return res.status(403).json({
                error:
                    "Insufficient permissions"
            });

        }


        return next();

    };

}


export {
    authenticate,
    authorize
};