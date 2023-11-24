import { StdioOptions, spawn } from "child_process";

/**
 * @param cwd current working directory
 * @param stdio an asynchonous ChildProcess of the command
 */
export function spawnCommand(
    cwd: string = ".", program: string, args: Array<string>, stdio?: StdioOptions | undefined) {
    return spawn(program, args, {
        cwd, stdio
    });
}

export function spawnSimpleCommand(program: string, args: Array<string>, stdio?: StdioOptions | undefined) {
    return spawn(program, args, {
        stdio
    });
}