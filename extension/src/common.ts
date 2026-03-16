import { LogPage, LogPageDetails } from "@logz/shared";
import { ChildProcessWithoutNullStreams, spawn } from "child_process";
import * as vscode from 'vscode';



class LogPageManager {
    private logPages: Record<string, LogPage>;
    private processes: Record<string, ChildProcessWithoutNullStreams>

    constructor() {
        this.logPages = {};
        this.processes = {};
    }

    private createLogPage(name: string, details: LogPageDetails): LogPage {
        const id = crypto.randomUUID()

        const newPage: LogPage = { id: id, name: name, logs: [], details: details }

        this.logPages[id] = newPage;

        return newPage;
    }

    public startProcess(command: string): { logPage: LogPage, process: ChildProcessWithoutNullStreams } {
        let process = spawn(command, {
            shell: true,
            cwd: vscode.workspace.workspaceFolders?.[0].uri.fsPath
        });

        const newPage = this.createLogPage(
            command,
            {
                type: 'PROCESS',
                processDetails: {
                    pid: process.pid!.toString(),
                    status: 'RUNNING',
                    command: command
                }
            })

        this.processes[newPage.id] = process;

        return { logPage: newPage, process: process }
    }

    public removeLogPage(id: string) {
        const page = this.logPages[id]
        if(page) {
            if(page.details.type == "PROCESS"){
                const process = this.processes[id];
                if(process){
                    console.log(process)
                    if (!process.kill()){
                        vscode.window.showErrorMessage(`Failed to close process ${process.pid}`);
                    }

                    delete this.processes[id]

                    vscode.window.showErrorMessage(`closed process ${process.pid}`);
                }
            }
        }
        delete this.logPages[id];
    }

    public getLogPages() {
        return this.logPages;
    }
}

export const logPageManager = new LogPageManager();