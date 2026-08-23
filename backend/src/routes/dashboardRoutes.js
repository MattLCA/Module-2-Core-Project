import express from "express";

import * as controller
    from "../controllers/dashboardController.js";

import {
    authenticate,
    authorize
} from "../middleware/auth.js";


const router =
    express.Router();


router.use(
    authenticate
);


// HR dashboard only
router.get(
    "/summary",
    authorize("hr"),
    controller.summary
);


export default router;