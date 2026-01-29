import express from "express";
import routes from "./route.js";
import commonUtils from "../utils/commonUtils.js";

const router = express.Router();

commonUtils.routeArray(routes, router);

export default router;
