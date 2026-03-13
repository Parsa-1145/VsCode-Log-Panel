import { VSCodeBadge, VSCodeButton, VSCodeDropdown, VSCodeOption, VSCodeTextField } from '@vscode/webview-ui-toolkit/react'
import { type Log, type LogLevel } from './store'
import { useEffect, useState } from 'react';

const logColors: Record<LogLevel, string> = {
  DEBUG: "--vscode-debugConsole-infoForeground",
  ERROR: "--vscode-debugConsole-errorForeground",
  INFO:  "--vscode-debugConsole-sourceForeground",
  WARNING: "--vscode-debugConsole-warningForeground",
}


function LogCard({ log }: { log: Log }) {
  return (
    <div className={`grid grid-cols-[auto_1fr] grid-rows-[auto_1fr] w-full p-2 gap-2 border-(--vscode-panel-border) log-hover-${log.level.toLowerCase()}`}>
      <div className="div flex items-center">
        <span className={`codicon codicon-${log.level.toLowerCase()}`} style={{ color: `var(${logColors[log.level]})` }}></span>
      </div>
      <div className='flex flex-row items-center '>
        <div className='flex flex-row gap-2 grow'>
          <VSCodeBadge>{log.group}</VSCodeBadge>
        </div>
        <div className='text-xs text-(--vscode-descriptionForeground)'>
          {log.time}
        </div>
      </div>
      <div className="flex justify-center">
        <div className={`w-px h-full`} style={{ background: `var(${logColors[log.level]})` }}></div>
      </div>
      <p className="whitespace-pre-wrap text-sm">
        {log.message}
      </p>
    </div>
  )
}


type IncomingMessage =
  | { command: "log"; log: Log }
  | { command: "reset"; }
  | { command: "logs"; logs: Log[] };


function App() {
  const [logs, setLogs] = useState<Log[]>([]);

  useEffect(() => {
    const handler = (event: MessageEvent<IncomingMessage>) => {
      const msg = event.data;
      console.log(msg)

      if (msg.command === "log") {
        setLogs(prev => [...prev.slice(-5000), msg.log]);
      }

      if (msg.command === "reset") {
        setLogs([]);
      }
      
      if (msg.command === "logs") {
        setLogs(prev => [...prev.slice(-5000), ...msg.logs]);
      }
    };
    
    window.addEventListener("message", handler);
    
    return () => {
      console.log("asdasd")
      window.removeEventListener("message", handler);
    };
  }, []);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-(--vscode-panel-background)">
      <div className="flex flex-row shrink-0 gap-2 p-2 border-b border-(--vscode-panel-border) bg-(--vscode-panel-background)">
        <div className='flex flex-row grow gap-2'>
          <VSCodeTextField placeholder='port'>

          </VSCodeTextField>
          <VSCodeButton>
            start
          </VSCodeButton>
        </div>
        <div className='flex flex-row gap-2'>
          <VSCodeDropdown ariaPlaceholder={"asd"}>
            <VSCodeOption>asdasd</VSCodeOption>
            <VSCodeOption>dsfdg</VSCodeOption>
          </VSCodeDropdown>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col">
          {logs.map((log, i) => (
            <LogCard key={i} log={log} />
          ))}
        </div>
      </div>

    </div>
  )
}

export default App