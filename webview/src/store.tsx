import type { Log, LogPage, ProcessDetails } from "@logz/shared"
import { createContext, useContext, useReducer, type Dispatch, type ReactNode } from "react"

type ProcessesAction =
  | { type: "logPages:add"; logPage: LogPage }
  | { type: "logPages:select"; logPageId: string }
  | { type: "logPages:remove"; id: string }
  | { type: "logPage:addLogs"; id: string, logs: Log[] }
  | { type: "logPages:load"; logPages: Record<string, LogPage> }
  | { type: "logPage:process:update"; id: string, patch: Partial<ProcessDetails> }
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
      return {
        ...state,
        pages: {
          ...state.pages,
          [action.logPage.id]: action.logPage
        }
      };
    }

    case "logPages:load": {
      return {
        ...state,
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
      if ((!pageToUpdate) || pageToUpdate.details.type != "PROCESS") {
        return state;
      }

      const details = pageToUpdate.details;
      const newProcessDetails = {...details.processDetails, ...action.patch}

      console.log(newProcessDetails)

      return {
        ...state,
        pages: {
          ...state.pages,
          [action.id]: {
            ...pageToUpdate,
            details: {
              ...details,
              processDetails: {
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

