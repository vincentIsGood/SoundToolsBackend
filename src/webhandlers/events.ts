import { ChildProcess } from "child_process";
import { websocketServers } from "..";
import { SoundToolsMessage } from "../messages/types";
import WebSocketWrapper from "../utils/WebSocketWrapper";
import { createAndConfigureWebSocket } from "../websocketconf";
import { sessionCommandMap, wsClientStore } from "./sessioninfo";

export const TEXT_DECODER = new TextDecoder();

export const wsServer = createAndConfigureWebSocket({
    connectionCallback(ws, req){
        // TODO: combine => invalid sessionID from client side, what's happening
        console.log("comming", req.sessionID);
        wsClientStore.set(req.sessionID, new WebSocketWrapper(ws));
    },
    onMessageCallback(sessionId, ws, data){
        const message = JSON.parse(TEXT_DECODER.decode(data as ArrayBuffer)) as SoundToolsMessage;
        if(message.event === "stop"){
            wsClientStore.get(sessionId).send({event: "received", data: {}});
            sessionCommandMap.get(sessionId)?.kill();
        }
    },
    onCloseCallback(sessionId, ws){
        wsClientStore.delete(sessionId);
    }
});
websocketServers.set("/soundtools/v1/events", wsServer);

export function handleCommandReturnError(code: number, sessionId: string){
    if(code != 0){
        wsClientStore.get(sessionId).send({event: "error", data: {
            code: 500,
            reason: "Received non-zero status exit code",
        }});
        return true;
    }
    return false;
}