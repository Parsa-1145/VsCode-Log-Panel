import { ChildProcessWithoutNullStreams, spawn } from 'child_process';
import * as vscode from 'vscode';
import LogViewProvider from './webview.js';
import { Log, LogLevel, LogPage } from "@logz/shared"
import { logPageManager } from './common';
import stripAnsi from 'strip-ansi';

interface LogzWrapperTaskDefinition extends vscode.TaskDefinition {
    wrappedTask: string;
}

const header = /^\[(.*?)\]\s+\[(.*?)\]\s+\[(.*?)\]\s+(.*)/

type LogParseResults = {
    logs: Log[],
    leftOver?: string
}
function parseLogs(text: string): LogParseResults {
    let result: LogParseResults = { logs: [] }

    const lines = text.split('\n')

    if (lines.length == 1) {
        return result
    }

    if (lines[lines.length - 1] !== "") {
        result.leftOver = lines.pop()
    }

    let current: Log | null = null

    for (const line of lines) {
        const strippedLine = stripAnsi(line)
        const m = strippedLine.match(header)

        if (m) {
            if (current) result.logs.push(current)

            current = {
                time: m[1],
                level: m[2] as LogLevel,
                group: m[3],
                message: m[4]
            }
        } else if (current) {
            current.message += '\n' + line
        }
    }

    if (current) result.logs.push(current)

    return result
}

export default class LogzWrapTaskProvider implements vscode.TaskProvider {
    provideTasks(token: vscode.CancellationToken): vscode.ProviderResult<vscode.Task[]> {
        return [];
    }

    constructor(private logView: LogViewProvider) { }

    resolveTask(_task: vscode.Task, token: vscode.CancellationToken): vscode.Task | undefined {
        const definition = _task.definition as LogzWrapperTaskDefinition;
        const task = new vscode.Task(
            definition,
            _task.scope || vscode.TaskScope.Workspace,
            _task.name,
            _task.source,
            new vscode.CustomExecution(async () => {
                return new WrapperPseudoterminal(definition.wrappedTask, this.logView);
            })
        );
        task.isBackground = false;
        return task;
    }
}

class WrapperPseudoterminal implements vscode.Pseudoterminal {

    private writeEmitter = new vscode.EventEmitter<string>();
    onDidWrite = this.writeEmitter.event;

    private closeEmitter = new vscode.EventEmitter<void>();
    onDidClose = this.closeEmitter.event;
    private process?: ChildProcessWithoutNullStreams;

    constructor(private wrappedId: string, private logView: LogViewProvider) { }



    async open(): Promise<void> {
        this.writeEmitter.fire(`Running: ${this.wrappedId}\r\n`);

        await vscode.commands.executeCommand(
            "logzPanelView.focus"
        );

        let { logPage, process } = logPageManager.startProcess(this.wrappedId);
        this.process = process;

        this.logView.postMessage({ action: "logPages:add", logPage: logPage })

        let leftOver = ""
        this.process.stdout.on('data', (data: Buffer) => {
            const chunk = leftOver + data.toString();
            console.log(process.killed)

            this.writeEmitter.fire(`${chunk.replace(/\n/g, "\r\n")}`);

            const result = parseLogs(chunk);
            logPage.logs.push(...result.logs);
            leftOver = result.leftOver??"";

            if (result.logs.length) {
                this.logView.postMessage({
                    action: "logPage:addLogs",
                    logs: result.logs,
                    pageId: logPage.id
                });
            }
        });

        this.process.on('close', (code: number) => {
            if (logPage.details.type == "PROCESS") {
                this.logView.postMessage({ action: "logPage:process:update", pageId: logPage.id, patch: { status: 'ENDED' } })
                logPage.details.processDetails.status = "ENDED";
            }

            this.writeEmitter.fire(`\r\nProcess exited with code ${code}\r\n`);
            this.closeEmitter.fire();
        });

    }

    close(): void {
        if (this.process) {
            this.process.kill();
        }
    }
}