import type { LogPage } from "@logPanelz/shared";
import { useLogPages } from "./store";
import type { ReactNode } from "react";
import vscode from "./vscode";

type PageAction = "SELECT" | "DELETE" | "TERMINATE" | "RESTART"

export default function LogPageList() {
    const { state, dispatch } = useLogPages();

    function handlePageAction(action: PageAction, logPageId: string) {
        switch (action) {
            case "SELECT": {
                dispatch({ type: "logPages:select", logPageId: logPageId })
                break;
            }
            case "DELETE": {
                vscode.postMessage({ action: "logPage:remove", pageId: logPageId })
                dispatch({ type: "logPages:remove", id: logPageId })
                break;
            }
            case 'TERMINATE': {
                vscode.postMessage({ action: "logPage:process:terminate", pageId: logPageId })
                dispatch({ type: "logPage:process:update", id: logPageId, patch: {status: "ENDED"} });
                break;
            }
            case 'RESTART': {
                vscode.postMessage({ action: "logPage:process:restart", pageId: logPageId })
                // dispatch({ type: "logPage:process:update", id: logPageId, patch: {status: "ENDED"} });
                break;
            }
        }
    }

    return (
        <div className="log-page-tabs" tabIndex={0}>
            {Object.entries(state.pages).map(([key, value]) => (
                <LogPageRow key={key} logPage={value} selected={state.selectedPageId === value.id} onSelect={handlePageAction} />
            ))}
        </div>
    );
}

function LogPageRow({ logPage, onSelect, selected }: { logPage: LogPage, onSelect: (action: PageAction, logPageId: string) => void, selected: boolean }) {
    function handleClick(e: React.MouseEvent<HTMLDivElement, MouseEvent>, action: PageAction) {
        e.stopPropagation()
        onSelect(action, logPage.id)
    }

    let details = <></>
    let actions: ReactNode[] = []

    if (logPage.details.type == "TASK") {
        if (logPage.details.taskDetails.status == "RUNNING") {
            details = <span className="codicon codicon-loading" />
            actions.push(
                <div className="page-action" onClick={e => handleClick(e, "TERMINATE")}>
                    <span className="codicon codicon-debug-stop" title="refresh">
                    </span>
                </div>
            )
        }
        actions.push(
            <div className="page-action" onClick={e => handleClick(e, "RESTART")}>
                <span className="codicon codicon-refresh" title="refresh">
                </span>
            </div>
        )
        actions.push(
            <div className="page-action" onClick={e => handleClick(e, "DELETE")}>
                <span className="codicon codicon-trash" title="button">
                </span>
            </div>
        )
    }

    return (
        <div className={`log-page-tabs-row ${selected ? "selected focused" : null}`} onClick={e => handleClick(e, "SELECT")} draggable={true}>
            <div className="label-icon">
                <span className="codicon codicon-terminal"></span>
                {logPage.name}
            </div>
            <div className="page-actions">
                {actions}
            </div>
            <div className="flex items-center justify-center">
                {details}
            </div>
        </div>
    );
}

