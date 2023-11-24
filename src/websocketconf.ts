import { Request } from "express";
import { RawData, WebSocket, WebSocketServer } from "ws";
import { sessionRequestHandler } from ".";
import ServerConfig from "./config";

export function createAndConfigureWebSocket({connectionCallback, onMessageCallback, onCloseCallback}: 
    {connectionCallback?: (ws: WebSocket, req: Request) => void,
    onMessageCallback?: (sessionId: string, ws: WebSocket, data: RawData, isBinary: boolean) => void,
    onCloseCallback?: (sessionId: string, ws: WebSocket) => void}){
    const wsServer = new WebSocketServer({noServer: true});

    wsServer.on("connection", (ws, req)=>{
        // @ts-ignore
        ws.isAlive = true;
        ws.on("error", console.error);
        ws.on("pong", ()=>{
            // @ts-ignore
            ws.isAlive = true;
        });
        // @ts-ignore
        sessionRequestHandler(req, {}, ()=>{
            const newReq: Request = req as Request;
            const sessId = newReq.sessionID;
            if(connectionCallback){
                connectionCallback(ws, newReq);
            }
            if(onMessageCallback){
                ws.on("message", (data, isBinary)=>{
                    try{
                        onMessageCallback(sessId, ws, data, isBinary);
                    }catch(e){
                        ws.emit("error", e);
                    }
                });
            }
            if(onCloseCallback){
                ws.on("close", ()=>{
                    try{
                        onCloseCallback(sessId, ws);
                    }catch(e){
                        ws.emit("error", e);
                    }
                })
            }
        });
    });

    const wsPingInterval = setInterval(()=>{
        wsServer.clients.forEach((ws)=>{
            // @ts-ignore
            if(ws.isAlive == false){
                ws.terminate();
                return;
            }

            // @ts-ignore
            ws.isAlive = false;
            ws.ping();
        });
    }, ServerConfig.WS_PING_INTERVAL);

    wsServer.on("close", ()=>{
        clearInterval(wsPingInterval);
    });

    return wsServer;
}