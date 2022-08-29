/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  LitElement,
  html,
  TemplateResult,
  css,
  PropertyValues,
  CSSResultGroup,
} from 'lit';
import { classMap } from "lit/directives/class-map";
import { customElement, property, state } from "lit/decorators";
import {
  HomeAssistant,

  fireEvent,
} from 'custom-card-helpers';

import { localize } from './localize/localize';
// import { HassDialog } from './dialogs/make-dialog-manager';
import { BroadlinkDialogParams } from './show-more-info-dialog';

export const haStyleDialog = css`
  /* mwc-dialog (ha-dialog) styles */
  ha-dialog {
    --mdc-dialog-min-width: 400px;
    --mdc-dialog-max-width: 600px;
    --mdc-dialog-heading-ink-color: var(--primary-text-color);
    --mdc-dialog-content-ink-color: var(--primary-text-color);
    --justify-action-buttons: space-between;
    --mdc-switch__pointer_events: auto;
  }

  ha-dialog .form {
    padding-bottom: 24px;
    color: var(--primary-text-color);
  }

  a {
    color: var(--accent-color) !important;
  }

  /* make dialog fullscreen on small screens */
  @media all and (max-width: 450px), all and (max-height: 500px) {
    ha-dialog {
      --mdc-dialog-min-width: calc(
        100vw - env(safe-area-inset-right) - env(safe-area-inset-left)
      );
      --mdc-dialog-max-width: calc(
        100vw - env(safe-area-inset-right) - env(safe-area-inset-left)
      );
      --mdc-dialog-min-height: 100%;
      --mdc-dialog-max-height: 100%;
      --vertial-align-dialog: flex-end;
      --ha-dialog-border-radius: 0px;
    }
  }
  mwc-button.warning {
    --mdc-theme-primary: var(--error-color);
  }
  .error {
    color: var(--error-color);
  }
`;

@customElement('remote-card-dialog2')
export class HuiMoreInfoBroadlink2 extends LitElement {


  @property({ attribute: false }) public hass!: HomeAssistant;

  @state() private _params?: BroadlinkDialogParams;


  public async showDialog(params: BroadlinkDialogParams): Promise<void> {
    this._params = params;
    await this.updateComplete;
  }

  public closeDialog() {
    this._params = undefined;
    fireEvent(this, "dialog-closed", { dialog: this.localName });
  }

  protected render(): TemplateResult | void {
    // if (!this._params) {
    //   return html``;
    // }

    return html`
    <ha-dialog
        open
        scrimClickAction
        hideActions
        @closed=${this.closeDialog}
        .heading=${this.hass!.localize(
          "ui.panel.lovelace.editor.edit_lovelace.header"
        )}
      >
        <div slot="heading" class="heading">
          <ha-header-bar>
            <div
              slot="title"
              class="main-title"
              .title=${this.hass!.localize("ui.panel.lovelace.menu.zones")}
            >
              ${this.hass!.localize("ui.panel.lovelace.menu.zones")}
            </div>
          </ha-header-bar>
        </div>
        <div class="contentFather">
          <div class="row">

          </div>
        </div>
        <div class="options">
          <mwc-button class="button-cancel" @click=${this._cancel}>
            ${localize("common.back")}</mwc-button
          >
        </div>
      </ha-dialog>
    `;
  }


  private _cancel(ev?: Event) {
    if (ev) {
      ev.stopPropagation();
    }
    this.closeDialog();
  }


  static get styles(): CSSResultGroup {
    return [
      haStyleDialog,
      css`
        ha-header-bar {
          --mdc-theme-on-primary: var(--primary-text-color);
          --mdc-theme-primary: var(--mdc-theme-surface);
          flex-shrink: 0;
        }
        /* overrule the ha-style-dialog max-height on small screens */
        @media all and (max-width: 450px), all and (max-height: 500px) {
          ha-header-bar {
            --mdc-theme-primary: var(--app-header-background-color);
            --mdc-theme-on-primary: var(--app-header-text-color, white);
          }
        }
        .row {
          background-color: green;
        }
      `,
    ];
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "remote-card-dialog2": HuiMoreInfoBroadlink2;
  }
}