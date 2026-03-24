export type LogLevel = "DEBUG" | "ERROR" | "INFO" | "WARNING"

export type Log = {
  message: string,
  group: string,
  time: string,
  level: LogLevel,
  seen?: boolean
}

export type TaskStatus = "RUNNING" | "ENDED"

export type TaskDetails = {
  command: string,
  taskName: string,
  status: TaskStatus
}

export type LogPageDetails =
  | {
    type: "TASK",
    taskDetails: TaskDetails
  }
  | {
    type: "SOCKET",
    port: string
  }
  | {
    type: "NOT_SPECIFIED"
  }

export type LogPage = {
  name: string,
  id: string,
  logs: Log[],
  details: LogPageDetails
}

export type WebviewCommand =
  | { action: "logPage:addLogs", logs: Log[], pageId: string }
  | { action: "logPages:add", logPage: LogPage }
  | { action: "logPage:process:update", pageId: string, patch: Partial<TaskDetails>}
  | { action: "logPages:load", logPages: Record<string, LogPage> };

export type ExtensionCommand =
  | { "action": "logPage:process:terminate", "pageId": string }
  | { "action": "logPage:process:restart", "pageId": string }
  | { "action": "logPage:remove", "pageId": string }
  | { "action": "ready" }