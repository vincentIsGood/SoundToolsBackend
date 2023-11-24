import { Request, Response } from "express";
import { app } from "..";
import { spawnSimpleCommand } from "../exectools/cmd";
import { ensureOneCommandJob, requireInitializedSession, requireSessionWebSocket } from "../utils/commonfilters";
import Randomizer from "../utils/randomizer";
import { handleCommandReturnError } from "./events";
import { sessionCommandExit, sessionCommandSpawn, wsClientStore } from "./sessioninfo";

app.post("/soundtools/v1/simple/combine", 
    [requireSessionWebSocket, requireInitializedSession, ensureOneCommandJob], (req: Request, res: Response)=>{
    const sessionId = req.sessionID;
    const session = req.session;
    const file1 = req.query.a as string;
    const file2 = req.query.b as string;

    if(!req.session.filesready.includes(file1) || !req.session.filesready.includes(file2)){
        res.status(404).send();
        return;
    }

    const filename = Randomizer.randomString(26) + ".mp3";
    const command = spawnSimpleCommand("ffmpeg", [
        "-i", "./temp/" + file1, 
        "-i", "./temp/" + file2, 
        "-filter_complex", "amix=inputs=2:duration=longest", 
        "./temp/" + filename
    ], "inherit");

    command.on("spawn", sessionCommandSpawn(session, ()=>{
        wsClientStore.get(sessionId).send({event: "received", data: {}});
    }));

    command.on("exit", sessionCommandExit<number, NodeJS.Signals>(session, (code, signal)=>{
        if(handleCommandReturnError(code, sessionId)){
            return;
        }
        wsClientStore.get(sessionId).send({event: "complete", data: [
            {type: "mixed", path: `/completedrequests/${filename}`},
        ]});
        session.filesready.push(filename);
    }));

    res.status(200).send();
});