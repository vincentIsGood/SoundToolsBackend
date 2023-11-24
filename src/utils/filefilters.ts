import { NextFunction, Request, Response } from "express";
import { writeFile, writeFileSync } from "fs";
import path from "path";
import Randomizer from "./randomizer";
import mime from "mime";

export interface FileConfig{
    destFolder: string;
    requiredExtensions?: Set<string>;
}

export function fileSaver(options: FileConfig): (req: Request, res: Response, next: NextFunction) => void{
    return (req, res, next)=>{
        if(!req.body){
            res.status(400);
            res.send();
            return;
        }

        let destFolder = options.destFolder;
        if(!destFolder){
            destFolder = ".";
        }

        let fileExt = mime.getExtension(req.headers["content-type"]);
        if(options.requiredExtensions){
            if(!options.requiredExtensions.has(fileExt)){
                res.status(400);
                res.send();
                return;
            }
        }

        const filename = Randomizer.randomString(26) + "." + fileExt;
        const outputFilename = path.join(destFolder, filename);

        writeFileSync(outputFilename, req.body);
        // @ts-ignore
        req.file = {
            filename,
            path: path.resolve(outputFilename),
            mimetype: req.headers["content-type"],
            size: req.body.length,
        }
        next();
    }
}