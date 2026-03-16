import type { LogLevel, Log, WebviewCommand } from '@logz/shared';
import { useRef, useEffect, useState } from "react";
import LogCard from './LogCard';
import { Group, Panel, Separator } from "react-resizable-panels";
import LogPageList from './ProcessesList';
import { useLogPages } from './store';
import { Virtuoso } from 'react-virtuoso';
import vscode from './vscode';


function App() {
  const { state, dispatch } = useLogPages();

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
          dispatch({ type: "logPages:add", logPage: msg.logPage });
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
      {/* <div className="flex flex-row shrink-0 gap-2 p-2 border-(--vscode-panel-border) bg-(--vscode-panel-background)">
        <div className='flex flex-row grow gap-2'>
          <VSCodeTextField placeholder='port'>

          </VSCodeTextField>
          <VSCodeButton onClick={() => window.location.reload()}>
            startdd
          </VSCodeButton>
        </div>
        <div className='flex flex-row gap-2'>
          <VSCodeDropdown ariaPlaceholder={"asd"}>
            <VSCodeOption>asdasd</VSCodeOption>
            <VSCodeOption>dsfdg</VSCodeOption>
          </VSCodeDropdown>
        </div>
      </div> */}
      <Group>
        <Panel>
          <Virtuoso
            style={{ height: "100%" }}
            data={logs}
            overscan={200}
            itemContent={(index, log) => <LogCard log={log} />}
          />
        </Panel>
        <Separator className='border-r border-(--vscode-panel-border)'></Separator>
        <Panel maxSize={"500px"}>
          <LogPageList>

          </LogPageList>
        </Panel>
      </Group>
    </div>
  )
}

export default App