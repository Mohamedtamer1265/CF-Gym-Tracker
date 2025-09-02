import express from "express";
import { getGyms, getUserVirtualGyms,unsolvedGyms } from "../controllers/gymsController.js";

const router = express.Router();
// /api/gyms/:handle
router.get("/", getGyms);
router.get("/virtual", getUserVirtualGyms); // all handles solved this gym as team
router.get("/unsolved", unsolvedGyms()); // no one of those handles solve these gyms
/*
third one I will handle by myself
solved by x handles and not solved by y handles
random problems from the published one
*/
export default router;
