import { Log, LogLevel } from "@logPanelz/shared"
import stripAnsi from "strip-ansi"

export default class LogParser {
    private leftOver: string | undefined = undefined

    public constructor(private header: RegExp = /^\[(.*?)\]\s+\[(.*?)\]\s+\[(.*?)\]\s+(.*)/) {

    }

    public parseLogs(text: string): Log[] {
        if (this.leftOver) {
            text = this.leftOver + text;
        }

        let logs: Log[] = []

        const lines = text.split('\n')

        if (lines.length == 1) {
            return []
        }

        if (lines[lines.length - 1] !== "") {
            this.leftOver = lines.pop()
        } else {
            this.leftOver = undefined;
        }

        let current: Log | null = null

        for (const line of lines) {
            const strippedLine = stripAnsi(line)
            const m = strippedLine.match(this.header)

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

}