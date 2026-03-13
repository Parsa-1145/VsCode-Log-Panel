import { VSCodeBadge, VSCodeDropdown, VSCodeOption, VSCodeTextField } from '@vscode/webview-ui-toolkit/react'
import { logs, type Log } from './store'

function LogCard({ log }: { log: Log }) {
  return (
    <div className={`flex flex-col p-2 gap-2 border-(--vscode-panel-border) log-hover-${log.level.toLowerCase()}`}>
      <div className='w-full flex flex-row justify-between'>
        <div className='flex flex-row gap-2 items-center'>
          <span className={`codicon codicon-${log.level.toLowerCase()} log-color-${log.level.toLowerCase()}`}></span>
          <VSCodeBadge>{log.group}</VSCodeBadge>
        </div>
        <div className='text-xs text-(--vscode-descriptionForeground)'>
          {log.time}
        </div>
      </div>
      <p className="whitespace-pre-wrap text-sm">
        {log.message}
      </p>
    </div>
  )
}

function App() {
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-(--vscode-panel-background)">
      <div className="flex flex-row shrink-0 p-2 border-b border-(--vscode-panel-border) bg-(--vscode-panel-background)">
        <VSCodeDropdown ariaPlaceholder={"asd"}>
          <VSCodeOption>asdasd</VSCodeOption>
          <VSCodeOption>dsfdg</VSCodeOption>
        </VSCodeDropdown>
        <VSCodeTextField>

        </VSCodeTextField>
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