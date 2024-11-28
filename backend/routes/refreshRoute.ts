import { refreshToken } from "../controllers/refresh";

const express = require('express')
const router = express.Router();

router.post('/:id', refreshToken);


export default router;