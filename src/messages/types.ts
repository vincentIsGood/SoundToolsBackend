export interface SoundToolsMessage{
    event: ServerEvents | ClientEvents;
    data: object;
}

type ServerEvents = "received" | "error" | "complete";
type ClientEvents = "stop";

// Data Messages
export interface ErrorMessage{
    code: number;
    reason: string;
}

export interface FileReadyMessage{
    type: string;
    path: string;
}