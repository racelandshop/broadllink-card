import { fireEvent } from "custom-card-helpers";


export interface BroadlinkDialogParams {
  broadlinkInfo;
  obj;
}

export const importBroadlinkDialog = () => import("./remote-card-dialog");

export const showBroadlinkDialog = (
  element: HTMLElement,
  BroadlinkDialogParams: BroadlinkDialogParams
): void => {
  fireEvent(element, "show-dialog", {
    dialogTag: "remote-card-dialog",
    dialogImport: importBroadlinkDialog,
    dialogParams: BroadlinkDialogParams,
  });
};