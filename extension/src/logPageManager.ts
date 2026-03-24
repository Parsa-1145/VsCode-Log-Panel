import { LogPage, LogPageDetails } from "@logPanelz/shared";
import { ChildProcessWithoutNullStreams, spawn } from "child_process";
import treeKill from "tree-kill";
import * as vscode from 'vscode';
import { LogWrapperTaskDefinition } from "./taskProvider";

function getTaskWorkspaceFolder(task: vscode.Task): vscode.WorkspaceFolder | undefined {
    if (task.scope && typeof task.scope === 'object') {
        return task.scope as vscode.WorkspaceFolder;
    }

    return vscode.workspace.workspaceFolders?.[0];
}

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

    public createTaskLogPage(task: vscode.Task): { logPage: LogPage, process: ChildProcessWithoutNullStreams } {
        const taskDefinition = task.definition as LogWrapperTaskDefinition
        const workspace = getTaskWorkspaceFolder(task)

        if (!workspace) {
            throw new Error('No workspace folder found for task.');
        }

        let process = spawn(taskDefinition.unixCommand, {
            shell: true,
            cwd: workspace.uri.fsPath
        });

        let logPage: LogPage | undefined = undefined;

        for (const pg of Object.values(this.logPages)) {
            if ((pg.details.type == "TASK") && (pg.details.taskDetails.taskName === task.name) && (pg.details.taskDetails.status == "ENDED")) {
                pg.details.taskDetails.status = "RUNNING"
                pg.logs.length = 0;
                logPage = pg;
                break;
            }
        }

        if (!logPage) {
            logPage = this.createLogPage(
                task.name,
                {
                    type: "TASK",
                    taskDetails: {
                        status: 'RUNNING',
                        command: taskDefinition.unixCommand,
                        taskName: task.name
                    }
                })
        }

        this.processes[logPage.id] = process;
        return { logPage: logPage, process: process }
    }

    public removeLogPage(pageId: string) {
        const page = this.logPages[pageId]
        if (page) {
            if (page.details.type == "TASK") {
                const process = this.processes[pageId];
                if (process) {
                    treeKill(process.pid!, (error?: Error) => {
                        if (error) {
                            vscode.window.showErrorMessage(error.message);
                        } else {
                            delete this.processes[pageId]
                        }
                    })
                } else {
                    delete this.logPages[pageId];
                }
            }
        }
    }

    public terminateProcess(pageId: string) {
        const page = this.logPages[pageId]
        if (page) {
            if (page.details.type == "TASK") {
                const process = this.processes[pageId];
                if (process) {
                    treeKill(process.pid!, (error?: Error) => {
                        if (error) {
                            vscode.window.showErrorMessage(error.message);
                        } else {
                            delete this.processes[pageId];
                        }
                    })
                }
            }
        }
    }

    public restartProcess(pageId: string) {
        const page = this.logPages[pageId]
        this.terminateProcess(pageId)
        // this.terminals[pageId].restart();
    }

    public getLogPages() {
        return this.logPages;
    }

    public clearLogPages() {
        for (const key of Object.keys(this.logPages)) {
            delete this.logPages[key]
        }
    }
}

export const logPageManager = new LogPageManager();