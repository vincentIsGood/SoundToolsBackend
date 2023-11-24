import express, { Request, Response } from "express";
import { unlink } from "fs";
import { app } from "..";
import ServerConfig from "../config";
import { spawnCommand } from "../exectools/cmd";
import { fileSaver } from "../utils/filefilters";
import { handleCommandReturnError } from "./events";
import path from "path";
import { ensureOneCommandJob, requireSessionWebSocket } from "../utils/commonfilters";
import { sessionCommandExit, sessionCommandMap, sessionCommandSpawn, wsClientStore } from "./sessioninfo";

// const multipartUpload = multer({dest: ServerConfig.TEMP_DIR});
app.post("/soundtools/v1/vocalremover", 
    [requireSessionWebSocket, ensureOneCommandJob, express.raw({type: "*/*", limit: "1gb"}), fileSaver({destFolder: ServerConfig.TEMP_DIR})], (req: Request, res: Response)=>{
    const sessionId = req.sessionID;
    const session = req.session;

    if(!isSupportedAudioType(req.file.mimetype)){
        unlink(req.file.path, (err)=>{
            if(err) console.error(err);
        });
        res.status(404).send();
        return;
    }

    const originalFilename = req.file.filename;
    const parsedOriginalFile = path.parse(originalFilename);
    const instrumentsFile = `${parsedOriginalFile.name}_Instruments.wav`;
    const vocalsFile = `${parsedOriginalFile.name}_Vocals.wav`;
    if(!session.filesready){
        session.filesready = [];
    }
    session.filesready.push(originalFilename);

    const command = spawnCommand("0_tools/vocal-remover", "python", [
        "-m", "inference", 
        "-i", `../../${ServerConfig.TEMP_DIR}/${originalFilename}`, 
        "-o", `../../${ServerConfig.TEMP_DIR}`, 
        "-P", "./models/baseline.pth"
    ], "inherit");
    sessionCommandMap.set(sessionId, command);

    command.on("spawn", sessionCommandSpawn(session, ()=>{
        wsClientStore.get(sessionId).send({event: "received", data: {}});
    }));

    command.on("exit", sessionCommandExit<number, NodeJS.Signals>(session, (code, signal)=>{
        if(handleCommandReturnError(code, sessionId)){
            return;
        }
        session.filesready.push(instrumentsFile, vocalsFile);
        session.save();
        wsClientStore.get(sessionId).send({event: "complete", data: [
            {type: "original", path: `/completedrequests/${originalFilename}`},
            {type: "instruments", path: `/completedrequests/${instrumentsFile}`},
            {type: "vocals", path: `/completedrequests/${vocalsFile}`},
        ]});
    }));

    res.send();
});

function isSupportedAudioType(mimetype: string){
    return mimetype === "audio/mp3" || mimetype === "audio/mpeg" || mimetype === "audio/wav";
}