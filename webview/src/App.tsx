import type { LogLevel, Log, WebviewCommand } from '@logPanelz/shared';
import { useRef, useEffect, useState, useCallback, type ReactNode } from "react";
import LogCard from './LogCard';
import { Group, Panel, Separator } from "react-resizable-panels";
import LogPageList from './ProcessesList';
import { useLogPages } from './store';
import { Virtuoso } from 'react-virtuoso';
import vscode from './vscode';
import CustomScrollContainer from './ScrollableElement';

function App() {
  const { state, dispatch } = useLogPages();
  const scrollParentRef = useRef<HTMLDivElement>(null);

  let logs: Log[] = [];

  if (state.selectedPageId) {
    logs = state.pages[state.selectedPageId].logs;
  }

  useEffect(() => {
    const handler = (event: MessageEvent<WebviewCommand>) => {
      const msg = event.data;
      switch (msg.action) {
        case 'logPage:addLogs': {
          dispatch({ type: "logPage:addLogs", id: msg.pageId, logs: msg.logs })
          break;
        }
        case 'logPages:add': {
          dispatch({ type: "logPages:add", logPage: msg.logPage, focus: true });
          break;
        }
        case 'logPages:load': {
          dispatch({ type: "logPages:load", logPages: msg.logPages });
          break;
        }
        case "logPage:process:update": {
          dispatch({ type: 'logPage:process:update', id: msg.pageId, patch: msg.patch })
          break;
        }
      }
    };

    vscode.postMessage({
      action: "ready"
    });

    window.addEventListener("message", handler);

    return () => {
      window.removeEventListener("message", handler);
    };
  }, []);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-(--vscode-panel-background)">
      <Group>
        <Panel>
          <CustomScrollContainer ref={scrollParentRef}>
            <Virtuoso
              data={logs}
              overscan={200}
              itemContent={(index, log) => <LogCard log={log} />}
              customScrollParent={scrollParentRef.current ?? undefined}
            />
          </CustomScrollContainer>
        </Panel>
        <Separator/>
        <Panel maxSize={"500px"}>
          <LogPageList />
        </Panel>
      </Group>
    </div>
  )
}

export default App
