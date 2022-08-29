/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    LitElement,
    html,
    TemplateResult,
    css,
    PropertyValues,
    CSSResultGroup,
  } from 'lit';
import { customElement, property, state } from "lit/decorators";
import { HomeAssistant, fireEvent } from 'custom-card-helpers';
import { localize } from './localize/localize';
import { BroadlinkDialogParams } from './show-more-info-dialog';
import { RemoteCardConfig } from './types';
import { remoteConfigSchema } from './schema';
import { addRemote } from './webhook';
import { fetchDevicesMac } from './helpers';

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

  @customElement('add-remote-dialog')
  export class HuiMoreInfoBroadlink2 extends LitElement {


    @property({ attribute: false }) public hass!: HomeAssistant;

    @state() private _params?: BroadlinkDialogParams;

    @state() private _helpers?: any;

    @property({ attribute: false }) preset?: string

    @property({ attribute: false }) _discovering?: boolean;

    @property({ attribute: false }) name_error_exists?: boolean;

    @property({ attribute: false }) name_error_none?: boolean;

    @property() _isLocked?: Array<string>;

    @state() private config!: RemoteCardConfig;

    @state() private broadlinkInfo: any;

    private _initialized = false;

    protected async firstUpdated(changedProps) {
      super.firstUpdated(changedProps);
      const Devices = await fetchDevicesMac(this.hass).then((resp) => { return resp })
      if (this.config ) this.config = { ...this.config, all_devices: Devices.map((device) => ({ mac: device.mac, device_type: device.device_type, presets: device.presets , is_locked: device.is_locked})) }
      fireEvent(this, 'config-changed', { config: this.config });
    }

    protected shouldUpdate(changedProps: PropertyValues): boolean {
      if (!this._initialized) {
        this._initialize();
      }
      if (changedProps.has('_discovering')) {
        return true
      }
      return true;
    }

    private _initialize(): void {
      if (this.hass === undefined) return;
      if (this.config === undefined) return;
      if (this._helpers === undefined) return;
      this._initialized = true;
    }


    public async showDialog(params: BroadlinkDialogParams): Promise<void> {
      this.name_error_exists = false;
      this.name_error_none = false;
      this._params = params;
      this.broadlinkInfo = this._params.broadlinkInfo;
      this.config = this.broadlinkInfo;
      await this.updateComplete;
    }

    public closeDialog() {
      this._params = undefined;
      fireEvent(this, "dialog-closed", { dialog: this.localName });
    }

    protected render(): TemplateResult | void {
      if (!this._params) {
        return html``;
      }

      const remoteTypeConfigSchemaData = {
        "name": this.config?.name,
        "remote_type": this.config?.remote_type || "tv",
        "selected_device_mac": this.config.selected_device_mac
      }

      return html`
      <ha-dialog
          open
          hideActions
          @closed=${this.closeDialog}
          .heading=${this.hass!.localize(
            "ui.panel.lovelace.editor.edit_lovelace.header"
          )}
        >
          <div slot="heading" class="heading">
            <ha-header-bar>
            <ha-icon-button
              slot="navigationIcon"
              dialogAction="cancel"
              .label=${this.hass!.localize(
                "ui.dialogs.more_info_control.dismiss"
               )}
              id="cancel"
              .path=${"M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"}
            ></ha-icon-button>
              <div
                slot="title"
                class="main-title"
                .title=${localize('editor.add_remote')}
              >
              ${localize('editor.add_remote')}
              </div>
            </ha-header-bar>
          </div>
          <div class="contentFather">
            <div class="row">
              <div class="box">
                ${this.name_error_exists ? html`
                <ha-alert alert-type="error">
                ${localize('editor.add_remote_error_exists')}
              </ha-alert>
                `
                : html``}
                ${this.name_error_none ? html`
                        <ha-alert alert-type="error">
                        ${localize('editor.add_remote_error_none')}
                      </ha-alert>
                        `
                : html``}
                <ha-form
                  .hass=${this.hass}
                  .data=${remoteTypeConfigSchemaData}
                  .schema=${remoteConfigSchema(this.config)}
                  .computeLabel=${(s) => s.label ?? s.name}
                  @value-changed=${this._changeCardOptions}
                ></ha-form>
              </div>
            </div>
            <mwc-button class="button-cancel" @click=${this._save}>
            ${localize("common.save")}
              </mwc-button>
          </div>
          <div class="options" slot="actions">
          </div>
        </ha-dialog>
      `;
    }

    private _changeCardOptions(ev): void {
      let newData = ev.detail.value;
      if (!this.config || !this.hass) {
        return;
      }
      if (newData) {
        if (newData.selected_device_mac !== undefined && this.config.preset === undefined) {
          newData = {
            ...newData,
            preset: this.config.name
          };
        }
        this.config = { ...this.config, ...newData };
        this.dispatchEvent(
          new CustomEvent("config-changed", { detail: { config: this.config } })
        );
      }
    }


    private async _cancel(ev?: Event) {
      if (ev) {
        ev.stopPropagation();
      }
    }
    private async _save() {

    this.name_error_exists = false;
      this.name_error_none = false;

      let index = 0;
      if (this.config?.all_devices) {
        for (let i = 0; i < this.config?.all_devices?.length; i++) {
          if (this.config?.all_devices[i].mac === this.config?.selected_device_mac) {
            index = i
          }
        }
      }
      const presets = this.config?.all_devices[index].presets
      const selectec_device_preset_list: any = []

      for (const [preset_name, preset_value] of Object.entries(presets)) {
        selectec_device_preset_list.push(preset_name)
      }

      if (!selectec_device_preset_list.includes(this.config.name) && this.config.name) {
        const response = addRemote(this.hass, this.config, this.config.name, this.config.remote_type);
        response.then((resp) => {
          if (resp.sucess) {
            fireEvent(this, "add-remote", { broadlinkInfo: this.config, all_devices: resp.devices.map((device) => ({ mac: device.mac, device_type: device.device_type, presets: device.presets , is_locked: device.is_locked})) });
          }
        })
        const Devices = await fetchDevicesMac(this.hass).then((resp) => { return resp })

        if (this.config) {
          this.config = { ...this.config, all_devices: Devices.map((device) => ({ mac: device.mac, device_type: device.device_type, presets: device.presets, is_locked: device.is_locked })), preset: this.config.name }
        }
        fireEvent(this, 'config-changed', { config: this.config });
        this.closeDialog();
      }
      if (!this.config.name){
        this.name_error_none = true
      } else {
        this.name_error_exists = true
      }
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
          .box {
            padding-top: 30px;
          }

          .div-options {
            width: 60%;
            display: flex;
            flex-wrap: wrap;
            padding: 30px 8px 8px;
            justify-content: flex-start;
            align-items: flex-start;
            flex-direction: row;
            align-content: stretch;
          }
          .contentFather {
            display: flex;
            flex-direction: column;
            align-items: flex-end;
          }
          .button-cancel {
            margin-top: 30px;
          }
        `,
      ];
    }
  }

  declare global {
    interface HTMLElementTagNameMap {
      "add-remote-dialog": HuiMoreInfoBroadlink2;
    }
  }