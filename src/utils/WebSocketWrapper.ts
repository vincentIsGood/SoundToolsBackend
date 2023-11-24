import { WebSocket } from "ws";
import { SoundToolsMessage } from "../messages/types";

export default class WebSocketWrapper{
    ws: WebSocket;

    constructor(ws: WebSocket){
        this.ws = ws;
    }
    
    send(obj: SoundToolsMessage, 
        errCallback?: (err?: Error) => void,
        options?: { mask?: boolean; binary?: boolean; compress?: boolean; fin?: boolean}){
        this.ws.send(JSON.stringify(obj), options, errCallback);
    }
}