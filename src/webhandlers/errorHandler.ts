import { NextFunction, Request, Response } from "express";

export function basicErrorHandler(err: Error, req: Request, res: Response, next: NextFunction){
    console.error(err);
    res.status(404);
    res.send();
}