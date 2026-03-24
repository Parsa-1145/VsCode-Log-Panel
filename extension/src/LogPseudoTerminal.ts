import treeKill from 'tree-kill';
import { logPageManager } from './logPageManager';
import { exitCode } from "process";
import * as vscode from 'vscode';
import { ChildProcessWithoutNullStreams, spawn } from 'child_process';
import LogViewProvider from './webview';
import { LogWrapperTaskDefinition } from './taskProvider';
import LogParser from './LogParser';

export class LogPseudoTerminal implements vscode.Pseudoterminal {
    private writeEmitter = new vscode.EventEmitter<string>();
    private closeEmitter = new vscode.EventEmitter<number>();
    private currentProcess: ChildProcessWithoutNullStreams | null = null;
    private logParser: LogParser;

    onDidClose = this.closeEmitter.event;
    onDidWrite = this.writeEmitter.event;

    constructor(private task: vscode.Task, private logView: LogViewProvider) {
        this.logParser = new LogParser()
    }

    async open(): Promise<void> {
        const taskDefinition = this.task.definition as LogWrapperTaskDefinition

        this.writeEmitter.fire(`Running: ${taskDefinition.unixCommand}\r\n`);
        await vscode.commands.executeCommand("logPanelView.focus");
        let { logPage, process } = logPageManager.createTaskLogPage(this.task);

        if (!logPage){
            vscode.window.showErrorMessage("Failed to launch the program")
            this.writeEmitter.fire(`Failed\r\n`);
            this.closeEmitter.fire(1);
            return;
        }

        this.currentProcess = process
        this.logView.postMessage({ action: "logPages:add", logPage: logPage })

        process.stdout.on('data', (data: Buffer) => {
            const chunk = data.toString();

            this.writeEmitter.fire(`${chunk.replace(/\n/g, "\r\n")}`);

            const logs = this.logParser.parseLogs(chunk);
            logPage.logs.push(...logs);
            if (logs.length) {
                this.logView.postMessage({
                    action: "logPage:addLogs",
                    logs: logs,
                    pageId: logPage.id
                });
            }
        });

        process.on('close', (code: number | null) => {
            if (logPage.details.type == "TASK") {
                this.logView.postMessage({ action: "logPage:process:update", pageId: logPage.id, patch: { status: 'ENDED' } })
                logPage.details.taskDetails.status = "ENDED";
            }
            this.writeEmitter.fire(`\r\nProcess exited with code ${code}\r\n`);
            this.closeEmitter.fire(1);
        });
    }

    public setupProcessCallbacks(process: ChildProcessWithoutNullStreams) {

    }

    handleInput(data: string): void {
        if (data === '\x03') {
            if (this.currentProcess && !this.currentProcess.killed) {
                this.writeEmitter.fire("^C");
                treeKill(this.currentProcess!.pid!);
            }
            return;
        }

        if (data === '\r') {
            this.writeEmitter.fire('\r\n');
        } else if (data === '\x7f') {
            this.writeEmitter.fire('\b \b');
        } else {
            this.writeEmitter.fire(data);
        }

        this.writeEmitter.fire(data);
        if (this.currentProcess?.stdin) {
            this.currentProcess.stdin.write(data === '\r' ? '\n' : data);
        }
    }

    close(): void {
        if (this.currentProcess && !this.currentProcess.killed) {
            treeKill(this.currentProcess.pid!);
        }
        this.closeEmitter.fire(0);
    }
}