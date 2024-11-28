import { Request, Response } from "express";
import { authUser } from "../controllers/auth";
import { verifyToken } from "../middleware/auth";
import { createQuote } from "../controllers/corporate";
import { verifyPermission } from "../middleware/verifypermission";
import {
    acceptQuote,
    finishQuote,
    cancelQuote,
    editQuote,
    getPendingQuotes,
    getQuoteById,
  } from "../controllers/corporate";

const express = require("express");
const router = express.Router();

router.post("/quote", verifyPermission, createQuote);



// Accept a quote
router.put("/quotes/:id/accept",verifyPermission, acceptQuote);

// Finish a quote
router.put("/quotes/:id/finish",verifyPermission, finishQuote);

// Cancel a quote
router.put("/quotes/:id/cancel",verifyPermission, cancelQuote);

// Edit a quote (only if not accepted)
router.put("/quotes/edit/:id",verifyPermission, editQuote);

// Get all pending quotes for service provider
router.get("/quotes/pending",verifyPermission, getPendingQuotes);

// Get a single quote by ID
router.get("/quotes/:id",verifyPermission, getQuoteById);

export default router;
