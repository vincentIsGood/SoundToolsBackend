import { NextFunction, Request, Response } from "express";
import { ErrorMessage } from "../messages/types";
import { wsClientStore } from "../webhandlers/sessioninfo";

export function requireSessionWebSocket(req: Request, res: Response, next: NextFunction){
    if(!wsClientStore.has(req.sessionID)){
        res.status(400).send({code: 400, reason: "Require ws event listener"} as ErrorMessage);
        return;
    }
    next();
}

export function requireInitializedSession(req: Request, res: Response, next: NextFunction){
    if(!req.session.filesready){
        res.status(400).send({code: 400, reason: "No ready & uploaded files"});
        return;
    }
    next();
}

export function ensureOneCommandJob(req: Request, res: Response, next: NextFunction){
    if(req.session.jobRunning){
        res.status(400).send({code: 400, reason: "One job at a time"} as ErrorMessage);
        return;
    }
    next();
}