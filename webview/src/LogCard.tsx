import type { Log } from "@logz/shared"
import { VSCodeBadge } from "@vscode/webview-ui-toolkit/react"
import { logColors } from "./common"

export default function LogCard({ log }: { log: Log }) {
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