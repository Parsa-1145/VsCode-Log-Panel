import type { Log, LogPage, TaskDetails } from "@logPanelz/shared"
import { createContext, useContext, useReducer, type Dispatch, type ReactNode } from "react"

type ProcessesAction =
  | { type: "logPages:add"; logPage: LogPage, focus?: boolean }
  | { type: "logPages:select"; logPageId: string }
  | { type: "logPages:remove"; id: string }
  | { type: "logPage:addLogs"; id: string, logs: Log[] }
  | { type: "logPages:load"; logPages: Record<string, LogPage> }
  | { type: "logPage:process:update"; id: string, patch: Partial<TaskDetails> }
  ;

type LogPageContextState = {
  pages: Record<string, LogPage>;
  selectedPageId?: string;
};

type LogPageContextType = {
  state: LogPageContextState;
  dispatch: Dispatch<ProcessesAction>;
};

const LogPageContext = createContext<LogPageContextType | undefined>(undefined);

function logPageReducer(
  state: LogPageContextState,
  action: ProcessesAction
): LogPageContextState {
  switch (action.type) {
    case "logPages:add": {
      let selection = state.selectedPageId;
      if (action.focus) {
        selection = action.logPage.id;
      }
      return {
        ...state,
        selectedPageId: selection,
        pages: {
          ...state.pages,
          [action.logPage.id]: action.logPage
        }
      };
    }

    case "logPages:load": {
      let selection = state.selectedPageId;
      if (!selection) {
        const pages = Object.values(action.logPages)

        const runningTaskPage = pages.find(p => p.details.type == "TASK" && p.details.taskDetails.status == "RUNNING")

        selection = pages[0]?.id
        if (runningTaskPage) {
          selection = runningTaskPage.id
        }
      }
      
      return {
        ...state,
        selectedPageId: selection,
        pages: action.logPages
      };
    }

    case "logPages:remove": {
      const newProcesses = { ...state.pages };
      delete newProcesses[action.id];

      let selectedPageId = state.selectedPageId
      if (state.selectedPageId == action.id) {
        selectedPageId = undefined;
      }
      return {
        ...state,
        pages: newProcesses,
        selectedPageId: selectedPageId
      };
    }

    case "logPages:select": {
      return {
        ...state,
        selectedPageId: action.logPageId
      };
    }

    case "logPage:addLogs": {
      const pageToUpdate = state.pages[action.id];
      if (!pageToUpdate) {
        return state;
      }

      const updatedLogs = [...pageToUpdate.logs, ...action.logs];

      return {
        ...state,
        pages: {
          ...state.pages,
          [action.id]: {
            ...pageToUpdate,
            logs: updatedLogs,
          },
        }
      };
    }

    case "logPage:process:update": {
      const pageToUpdate = state.pages[action.id];
      if ((!pageToUpdate) || pageToUpdate.details.type != "TASK") {
        return state;
      }

      const details = pageToUpdate.details;
      const newProcessDetails = { ...details.taskDetails, ...action.patch }

      return {
        ...state,
        pages: {
          ...state.pages,
          [action.id]: {
            ...pageToUpdate,
            details: {
              ...details,
              taskDetails: {
                ...newProcessDetails,
              }
            }
          },
        }
      };
    }

    default:
      return state;
  }
}

export function LogPageProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(logPageReducer, { pages: {} });

  return (
    <LogPageContext.Provider value={{ state, dispatch }}>
      {children}
    </LogPageContext.Provider>
  );
}

export function useLogPages() {
  const ctx = useContext(LogPageContext);
  if (!ctx) {
    throw new Error("useProcesses must be used within a ProcessesProvider");
  }
  return ctx;
}

