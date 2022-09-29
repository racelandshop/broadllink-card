import { fireEvent } from "custom-card-helpers";


export interface DigitsDialogParams {
  broadlinkInfo;
}

export const importDigitsDialog = () => import("./digits-dialog");

export const showDigitsDialog = (
  element: HTMLElement,
  DigitsDialogParams: DigitsDialogParams
): void => {
  fireEvent(element, "show-dialog", {
    dialogTag: "digits-dialog",
    dialogImport: importDigitsDialog,
    dialogParams: DigitsDialogParams,
  });
};