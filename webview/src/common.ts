import type { LogLevel } from "@logz/shared";

export const logColors: Record<LogLevel, string> = {
    DEBUG: "--vscode-debugConsole-infoForeground",
    ERROR: "--vscode-debugConsole-errorForeground",
    INFO: "--vscode-debugConsole-sourceForeground",
    WARNING: "--vscode-debugConsole-warningForeground",
}

