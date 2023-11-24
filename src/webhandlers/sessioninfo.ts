import { Request, Response } from "express";
import { app } from "..";
import { ChildProcess } from "child_process";
import WebSocketWrapper from "../utils/WebSocketWrapper";
import session from "express-session";

declare module 'express-session' {
    interface SessionData {
        filesready: string[];
        jobRunning: boolean;
    }
}

export const sessionCommandMap = new Map<string, ChildProcess>();
export const wsClientStore = new Map<string, WebSocketWrapper>();

export function sessionCommandSpawn(session: session.Session & Partial<session.SessionData>, returnCallback: ()=>void){
    session.jobRunning = true;
    return returnCallback;
}
export function sessionCommandExit<A = undefined, B = undefined>(session: session.Session & Partial<session.SessionData>, returnCallback: (a: A, b: B)=>void){
    session.jobRunning = false;
    return returnCallback;
}

// get files
app.get("/soundtools/v1/info", (req: Request, res: Response)=>{
    res.status(200).send(req.session.filesready || []);
});