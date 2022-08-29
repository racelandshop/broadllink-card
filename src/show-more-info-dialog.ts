import { fireEvent } from "custom-card-helpers";


export interface BroadlinkDialogParams {
  broadlinkInfo; //CameraInfo is a list of camera info (add this later with the corresponding camera info interface)
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