import { CookieOptions } from "express";

export default class ServerConfig{
    static PORT = 8080;
    static WS_PING_INTERVAL = 5 * 60 * 1000; // 5min
    
    static ALLOWED_ORIGINS = ["http://127.0.0.1:8080", "http://127.0.0.1:5173", "http://localhost:5173"];
    static USE_HTTPS = true;
    static KEY_PATH = ".certs/domain.key";
    static CERT_PATH = ".certs/domain.crt";

    static TEMP_DIR = "temp/";

    static createCookieOptions(): CookieOptions{
        return {
            expires: new Date(Date.now() + 60*1000),
            httpOnly: true,
        };
    }
}