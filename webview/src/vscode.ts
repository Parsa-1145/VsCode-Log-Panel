import type { ExtensionCommand } from "@logz/shared";

declare const acquireVsCodeApi: () => {
  postMessage: (msg: ExtensionCommand) => void;
};
const vscode = acquireVsCodeApi();
export default vscode;
