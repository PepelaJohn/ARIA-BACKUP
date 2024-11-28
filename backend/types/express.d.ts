// src/types/express.d.ts (or wherever you decide to place it)
import * as express from 'express';

declare global {
    namespace Express {
        interface Request {
            role?:string;
            userId?: string; 
            
        }
    }
}
