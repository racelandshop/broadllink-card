import { fireEvent } from "custom-card-helpers";


export interface BroadlinkDialogParams {
  broadlinkInfo; //CameraInfo is a list of camera info (add this later with the corresponding camera info interface)
}

export const importBroadlinkDialog = () => import("./remove-remote-dialog");

export const showRemoveRemoteDialog = (
  element: HTMLElement,
  BroadlinkDialogParams: BroadlinkDialogParams
): void => {
  fireEvent(element, "show-dialog", {
    dialogTag: "remove-remote-dialog",
    dialogImport: importBroadlinkDialog,
    dialogParams: BroadlinkDialogParams,
  });
};