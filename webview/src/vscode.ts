import type { ExtensionCommand } from "@logPanelz/shared";

declare const acquireVsCodeApi: () => {
  postMessage: (msg: ExtensionCommand) => void;
};
const vscode = acquireVsCodeApi();
export default vscode;
