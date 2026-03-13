type LogLevel = "DEBUG" | "ERROR" | "INFO" | "WARNING"
type Log = {
  message: string,
  time: string,
  group: string,
  level: LogLevel
}


const logs: Log[] = [
  {
    message: "Server started on port 3000",
    time: "10:00:01",
    group: "server",
    level: "INFO"
  },
  {
    message: "Connected to PostgreSQL database",
    time: "10:00:03",
    group: "database",
    level: "INFO"
  },
  {
    message: "User authentication request received",
    time: "10:01:10",
    group: "auth",
    level: "DEBUG"
  },
  {
    message: "Token validation succeeded for user id=4821",
    time: "10:01:11",
    group: "auth",
    level: "WARNING"
  },
  {
    message: "Fetching user profile from database",
    time: "10:01:11",
    group: "database",
    level: "DEBUG"
  },
  {
    message: "Unhandled exception while processing request\nError: Cannot read properties of undefined (reading 'id')\n    at UserService.getProfile (/src/services/user.ts:42:18)\n    at processRequest (/src/server.ts:88:12)",
    time: "10:02:34",
    group: "server",
    level: "ERROR"
  },
  {
    message: "Retrying database connection...",
    time: "10:02:36",
    group: "database",
    level: "INFO"
  },
  {
    message: "Database connection restored successfully",
    time: "10:02:37",
    group: "database",
    level: "INFO"
  },
  {
    message: "Incoming HTTP request\nMethod: GET\nRoute: /api/projects\nClient: 127.0.0.1",
    time: "10:03:12",
    group: "http",
    level: "INFO"
  },
  {
    message: "Cache miss for key: projects:list",
    time: "10:03:12",
    group: "cache",
    level: "DEBUG"
  },
  {
    message: "Projects loaded from database (count=24)",
    time: "10:03:13",
    group: "database",
    level: "INFO"
  },
  {
    message: "Cache updated for key: projects:list (ttl=300s)",
    time: "10:03:13",
    group: "cache",
    level: "DEBUG"
  },
  {
    message: "Worker job started\nJob: cleanup-temp-files\nSchedule: */5 * * * *",
    time: "10:05:00",
    group: "worker",
    level: "INFO"
  },
  {
    message: "Deleted temporary files\nCount: 17\nFreed space: 42MB",
    time: "10:05:01",
    group: "worker",
    level: "INFO"
  },
  {
    message: "Memory usage warning\nHeap Used: 812MB\nHeap Limit: 1024MB\nRecommendation: investigate memory leak",
    time: "10:06:22",
    group: "monitor",
    level: "ERROR"
  }
]

export {type Log, type LogLevel, logs};