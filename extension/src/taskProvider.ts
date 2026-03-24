import * as vscode from 'vscode';

import LogViewProvider from './webview.js';
import { LogPseudoTerminal } from './LogPseudoTerminal.js';

export interface LogWrapperTaskDefinition extends vscode.TaskDefinition {
    unixCommand: string;
}

export default class LogzWrapTaskProvider implements vscode.TaskProvider {
    provideTasks(token: vscode.CancellationToken): vscode.ProviderResult<vscode.Task[]> {
        return [];
    }

    constructor(private logView: LogViewProvider) { }

    resolveTask(_task: vscode.Task, token: vscode.CancellationToken): vscode.Task | undefined {
        const task = new vscode.Task(
            _task.definition,
            _task.scope || vscode.TaskScope.Workspace,
            _task.name,
            _task.source,
            new vscode.CustomExecution(async (_definition) => {
                return new LogPseudoTerminal(_task, this.logView);
            })
        );
        task.isBackground = true;

        return task;
    }
}
