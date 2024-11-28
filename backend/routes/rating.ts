import { getRatings } from "../controllers/ratings";
import { verifyToken } from "../middleware/auth";
import { verifyPermission } from "../middleware/verifypermission";


const express = require("express");

const router = express.Router();

router.get("/", verifyToken,verifyPermission, getRatings);

export default router;
