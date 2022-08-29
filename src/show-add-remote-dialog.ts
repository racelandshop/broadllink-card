import { fireEvent } from "custom-card-helpers";


export interface BroadlinkDialogParams {
  broadlinkInfo;
}

export const importBroadlinkDialog = () => import("./add-remote-dialog");

export const showAddRemoteDialog = (
  element: HTMLElement,
  BroadlinkDialogParams: BroadlinkDialogParams
): void => {
  fireEvent(element, "show-dialog", {
    dialogTag: "add-remote-dialog",
    dialogImport: importBroadlinkDialog,
    dialogParams: BroadlinkDialogParams,
  });
};