import cors from "cors";
import express, { Express } from "express";
import session from "express-session";
import filestore from "session-file-store";
import { readFileSync } from "fs";
import { Server } from "http";
import https from "https";
import { WebSocketServer } from "ws";
import ServerConfig from "./config";

const FileStore = filestore(session);

const app: Express = express();
const websocketServers = new Map<string, WebSocketServer>();

const sessionRequestHandler = session({
    secret: "session-secret",
    store: new FileStore(),
    name: "sessid",
    cookie: {
        maxAge: 120 * 60*1000, // 60mins
        httpOnly: true,
        sameSite: "none",
        secure: true,
    },
    resave: false,
    saveUninitialized: true,
});

app.use(cors({
    credentials: true,
    origin: ServerConfig.ALLOWED_ORIGINS,
}));
app.use(sessionRequestHandler);
app.use("/public", express.static('public'));
app.use("/completedrequests", express.static('temp'));

export { app, sessionRequestHandler, websocketServers };

// ----------- DEFINE HANDLERS -----------
import { basicErrorHandler } from "./webhandlers/errorHandler";
import "./webhandlers/events";
import "./webhandlers/sessioninfo";
import "./webhandlers/simpleaudiotools";
import "./webhandlers/vocalremover";

app.use(basicErrorHandler);
// ---------------------------------------

let server: Server;
if(ServerConfig.USE_HTTPS){
    server = https.createServer({
        key: readFileSync(ServerConfig.KEY_PATH),
        cert: readFileSync(ServerConfig.CERT_PATH),
    }, app).listen(ServerConfig.PORT, ()=>{
        console.log("Server with HTTPS is running on port: " + ServerConfig.PORT);
    });
}else{
    server = app.listen(ServerConfig.PORT, ()=>{
        console.log("Server is running on port: " + ServerConfig.PORT);
    });
}

// ----------- UPGRADE HANDLERS -----------
// const wsServer = new WebSocketServer({noServer: true});
// https://www.npmjs.com/package/ws
server.on("upgrade",  (req, socket, head)=>{
    try{
        // eg. pathname = "/foo/bar"
        const url = new URL(req.url, `https://${req.headers.host}`);
        const pathname = url.pathname;
        for(let key of websocketServers.keys()){
            if(pathname === key){
                const wsServer = websocketServers.get(key);
                wsServer.handleUpgrade(req, socket, head, (ws)=>{
                    wsServer.emit("connection", ws, req);
                });
                return;
            }
        }
    }catch(e){}
    socket.destroy();
});

// ----------------------------------------

