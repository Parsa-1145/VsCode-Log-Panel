import { ChildProcessWithoutNullStreams, spawn } from 'child_process';
import * as vscode from 'vscode';
import LogViewProvider from './webview';

interface LogzWrapperTaskDefinition extends vscode.TaskDefinition {
    wrappedTask: string;
}


type LogLevel = "DEBUG" | "ERROR" | "INFO" | "WARNING";
type Log = {
    time: string;
    level: LogLevel;
    group: string;
    message: string;
};

const header = /^\[(.*?)\]\s+\[(.*?)\]\s+\[(.*?)\]\s+(.*)/

function parseLogs(text: string): Log[] {
  const lines = text.split('\n')
  const logs: Log[] = []

  let current: Log | null = null

  for (const line of lines) {
    const m = line.match(header)

    if (m) {
      if (current) logs.push(current)

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

  if (current) logs.push(current)

  return logs
}

export default class LogzWrapTaskProvider implements vscode.TaskProvider {
    provideTasks(token: vscode.CancellationToken): vscode.ProviderResult<vscode.Task[]> {
        return [];
    }

    constructor(private logView: LogViewProvider) { }

    async resolveTask(_task: vscode.Task, token: vscode.CancellationToken): Promise<vscode.Task | undefined> {
        const definition = _task.definition as LogzWrapperTaskDefinition;
        const task = new vscode.Task(
            definition,
            _task.scope || vscode.TaskScope.Workspace,
            _task.name,
            'logz-wrapper',
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

        this.process = spawn(this.wrappedId, {
            shell: true,
            cwd: vscode.workspace.workspaceFolders?.[0].uri.fsPath
        });
        this.logView.postMessage({command: "reset"})

        this.process.stdout.on('data', (data: Buffer) => {
            const chunk = data.toString();

            const result = parseLogs(chunk);

            if (result.length) {
                this.logView.postMessage({
                    command: "logs",
                    logs: result
                });
            }

        });

        // this.process.stderr.on('data', (data: Buffer) => {
        //     this.writeEmitter.fire(data.toString());
        // });

        this.process.on('close', (code: number) => {
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
