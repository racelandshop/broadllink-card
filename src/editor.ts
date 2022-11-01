/* eslint-disable @typescript-eslint/no-explicit-any */
import { LitElement, html, TemplateResult, css, CSSResultGroup, PropertyValues} from 'lit';
import { HomeAssistant, fireEvent, LovelaceCardEditor, ActionHandlerEvent, ActionConfig, hasAction, } from 'custom-card-helpers';
import { actionHandler } from "./action-handler-directive";
import { RemoteCardConfig } from './types';
import { customElement, property, state } from 'lit/decorators';
import { classMap } from "lit/directives/class-map";
import { localize } from './localize/localize';
import { discoverDevices, defineDefault, fetchDevicesMac } from './helpers'
import { remoteEditorSchema } from './schema'
import { showAddRemoteDialog } from './show-add-remote-dialog';
import { removeRemote } from './webhook';

@customElement('remote-card-editor')
export class RemoteCardEditor extends LitElement implements LovelaceCardEditor {
  @property({ attribute: false }) public hass?: HomeAssistant;

  @state() private _config?: RemoteCardConfig;

  @state() private _toogle?: boolean;

  @state() private _helpers?: any;

  @state() private path?: string;

  @property({ attribute: false }) preset?: string

  @state() private _presetList?: number;

  @property() selectec_device_preset_list?: Array<string>;

  @property({ attribute: false }) _discovering?: boolean;

  @property() _isLocked?: boolean;

  private _initialized = false;

  public setConfig(config: RemoteCardConfig): void {
    this._config = config;
    this.preset = this._config.preset
    this._discovering = false;
    this.loadCardHelpers();
  }

  protected async firstUpdated(changedProps) {
    super.firstUpdated(changedProps);
    const Devices = await fetchDevicesMac(this.hass).then((resp) => { return resp })
    if (this._config ) this._config = { ...this._config, all_devices: Devices.map((device) => ({ mac: device.mac, device_type: device.device_type, presets: device.presets , is_locked: device.is_locked})) }
    fireEvent(this, 'config-changed', { config: this._config });

    window.addEventListener("add-remote", (ev: any) => {
      console.log("fired add-remote")
      console.log("This is the detailts", ev.detail)


      // const config = {
      //   ...this.config,
      //   all_devices: Devices.map((device) => ({ mac: device.mac, device_type: device.device_type, presets: device.presets, is_locked: device.is_locked })),
      //   preset: config_name,
      //   presets: Devices[index].presets
      // }

      this.preset = ev.detail.broadlinkInfo.name;
      if (this._config) this._config = {
        ...this._config,
        all_devices: ev.detail.all_devices.map((device) => ({ mac: device.mac, device_type: device.device_type, presets: device.presets, is_locked: device.is_locked })),
        preset: this.preset,
        presets: ev.detail.all_devices[ev.detail.index].presets
      }

      fireEvent(this, 'config-changed', { config: this._config });

      if (this.preset ) this._changePreset(this.preset);

    });
    this.path = "M12,0C8.96,0 6.21,1.23 4.22,3.22L5.63,4.63C7.26,3 9.5,2 12,2C14.5,2 16.74,3 18.36,4.64L19.77,3.23C17.79,1.23 15.04,0 12,0M7.05,6.05L8.46,7.46C9.37,6.56 10.62,6 12,6C13.38,6 14.63,6.56 15.54,7.46L16.95,6.05C15.68,4.78 13.93,4 12,4C10.07,4 8.32,4.78 7.05,6.05M12,15A2,2 0 0,1 10,13A2,2 0 0,1 12,11A2,2 0 0,1 14,13A2,2 0 0,1 12,15M15,9H9A1,1 0 0,0 8,10V22A1,1 0 0,0 9,23H15A1,1 0 0,0 16,22V10A1,1 0 0,0 15,9Z";
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

  get _name(): string {
    return this._config?.name || '';
  }

  get _entity_id(): string {
    return this._config?.entity_id || '';
  }

  get _preset(): string{
    return this._config?.preset || ''
  }

  get _show_warning(): boolean {
    return this._config?.show_warning || false;
  }

  get _show_error(): boolean {
    return this._config?.show_error || false;
  }

  get _tap_action(): ActionConfig {
    return this._config?.tap_action || { action: 'more-info' };
  }

  get _hold_action(): ActionConfig {
    return this._config?.hold_action || { action: 'none' };
  }

  get _double_tap_action(): ActionConfig {
    return this._config?.double_tap_action || { action: 'none' };
  }


  protected render(): TemplateResult | void {
    if (!this.hass || !this._helpers) {
      return html`
      <mwc-button class="discover ${classMap({ "spin": this._discovering === true })}"
        @action=${this._handleAction}>
        ${localize('editor.discover')}
      </mwc-button>`;
    }


    let index = 0;
    if (this._config?.all_devices) {
      for (let i = 0; i < this._config?.all_devices?.length; i++) {
        if (this._config?.all_devices[i].mac === this._config?.selected_device_mac) {
          index = i
        }
      }
    }
    const presets = this._config?.all_devices[index]?.presets;
    if (presets) {
      const selectec_device_preset_list: any = [];
      for (const [preset_name, preset_value] of Object.entries(presets)) {
        selectec_device_preset_list?.push(preset_name);
      }
      this._presetList = this.selectec_device_preset_list?.length;
      this._isLocked = this._config?.all_devices[index].is_locked;
      this.selectec_device_preset_list = selectec_device_preset_list;
    }
    const remoteTypeConfigSchemaData = {
      "selected_device_mac": this._config?.selected_device_mac,
    }
    return html`
      <div class="card-config">
        <mwc-button class="discover ${classMap({"spin": this._discovering === true})}"
          @action=${this._handleAction}
          .actionHandler=${actionHandler({ hasHold: hasAction() })}>
          ${localize('editor.discover')}
        </mwc-button>
        ${this._isLocked ? html`
              <div id="box">
                <ha-form
                  .hass=${this.hass}
                  .data=${remoteTypeConfigSchemaData}
                  .schema=${remoteEditorSchema(this._config)}
                  .computeLabel=${(s) => s.label ?? s.name}
                  @value-changed=${this._changeCardOptions}
                ></ha-form>
              </div>
                <ha-alert id="error" alert-type="error">
                  ${localize('editor.error')}
              </ha-alert>
                `
      : html`
          <div class="box">
            <ha-form
              .hass=${this.hass}
              .data=${remoteTypeConfigSchemaData}
              .schema=${remoteEditorSchema(this._config)}
              .computeLabel=${(s) => s.label ?? s.name}
              @value-changed=${this._changeCardOptions}
            ></ha-form>
          </div>
          <div id="current">${localize('editor.current_remote')}</div>
          <div class= "div-options">
            <div class="presets">
            ${this._config?.selected_device_mac !== undefined ? this.selectec_device_preset_list?.map((preset) =>
              html `
              <ha-card class = "preset-card ${classMap({
                  "on": this.preset === preset,
                  "off": this.preset !== preset})}"
                  @action=${this._changePreset.bind(this, preset)}
                  .actionHandler=${actionHandler({ hasHold: hasAction() })}>
                  <span>${preset}</span>
              </ha-card>`
            ) : html``
          }
            </div>
            <div class="actions">
              ${this._presetList !== 0 ? html`
                <mwc-button id="button-cancel" @click=${this._removeRemoteButton}>
                  ${localize('editor.remove_remote')}
                  <ha-svg-icon .path=${this.path}></ha-svg-icon>
                </mwc-button>
              ` : html``}
                <mwc-button @click=${this._showAddRemoteDialog} id="buttons">
                  ${localize('editor.add_remote')}
                  <ha-svg-icon .path=${this.path}></ha-svg-icon>
                </mwc-button>
            </div>
          </div class= "div-options">
      `}
      </div class = "card-config">
    `;
  }

  private _initialize(): void {
    if (this.hass === undefined) return;
    if (this._config === undefined) return;
    if (this._helpers === undefined) return;
    this._initialized = true;
    // this._handleAction();
  }


  private async loadCardHelpers(): Promise<void> {
    this._helpers = await (window as any).loadCardHelpers();
  }

  private async _handleAction (ev: ActionHandlerEvent): Promise<void>{
    if (ev) {
      this._discovering = true
      const Devices = await discoverDevices(this.hass).then((resp) => {
        return resp;
      })
      this._discovering = false
      if (this._config) {
        const active_selected_mac = defineDefault(this._config.selected_device_mac)
        this._config = { ...this._config, all_devices: Devices.map((device) => ({ mac: device.mac, device_type: device.device_type, presets: device.presets, is_locked: device.is_locked })) }
        if (!(Devices.map(device => device.mac).includes(active_selected_mac))) {
          delete this._config.selected_device_mac;
          delete this._config.preset;
          delete this._config.remote_type;
          fireEvent(this, "config-changed", { config: this._config });

        } else {
          fireEvent(this, 'config-changed', { config: this._config });
        }
      }
    }
  }

  private async _removeRemoteButton() {
    const response = removeRemote(this.hass, this._config, this._config?.preset);
    const Devices = await fetchDevicesMac(this.hass).then((resp) => { return resp })
    let index = 0;
    if (this._config?.all_devices) {
      for (let i = 0; i < this._config?.all_devices?.length; i++) {
        if (this._config?.all_devices[i].mac === this._config?.selected_device_mac) {
          index = i
        }
      }
    }
    response.then((resp) => {
      if (resp.sucess) {
          if (this._config ) this._config = { ...this._config, all_devices: Devices.map((device) => ({ mac: device.mac, device_type: device.device_type, presets: device.presets , is_locked: device.is_locked})), preset: Object.keys(this._config.all_devices[index].presets)[Object.keys(this._config.all_devices[index].presets).length - 1]}
        fireEvent(this, 'config-changed', { config: this._config });
        this._changePreset(Object.keys(this._config?.all_devices[index].presets)[Object.keys(this._config?.all_devices[index].presets).length - 1]);
        }
      })
  }

  private _showAddRemoteDialog() {
    showAddRemoteDialog(
      this,
      { broadlinkInfo: this._config }
    )
  }

  private _changePreset(key: string): void {
    if (!this._config || !this.hass) {
      return;
    }
    if (!this._config.presets) {
      return;
    }
    const presetEntityID = this._config.presets[key].entity_id
    this._config = { ...this._config, preset: key, entity_id: presetEntityID}
    this.preset = key
    fireEvent(this, 'config-changed', { config: this._config });
  }

  private _changeCardOptions(ev): void {
    if (!this._config || !this.hass) {
      return;
    }
    let newData = ev.detail.value;
    if (newData) {
      if (newData.selected_device_mac !== undefined && this._config.preset === undefined) {
        newData = {
          ...newData,
          preset: ''
        };
      }
      this._config = { ...this._config, ...newData };
      this.dispatchEvent(
        new CustomEvent("config-changed", { detail: { config: this._config } })
      );
    }
  }

  static get styles(): CSSResultGroup {
    return css`
      ha-card{
        width: 40%;
        height: 30%;
        background-color: var(--ha-card-background);
        border: 2px solid var(--divider-color);
        cursor: pointer;
        display: flex;
        justify-content: center;
      }
      .presets {
        width: 100%;
        margin-bottom: 10px;
      }
      ha-card.preset-card{
        width: 24%;
        padding: 2%;
        margin: 2%;
        float: left;
        text-align: center;
      }
      ha-card.preset-card.on{
        color: var(--accent-color);
        box-shadow: 0px 0px 10px var(--accent-color) , 0px 0px 10px var(--accent-color);
      }

      .discover.spin::before {
        animation: 1.5s linear infinite spinner;
        animation-play-state: inherit;
        border: solid 5px #cfd0d1;
        border-bottom-color: var(--primary-background-color);
        border-radius: 50%;
        border-width: 10%;
        content: "";
        height: 50px;
        width: 50px;
        position: absolute;
        left: 50%;
        top: 92px;
        transform: translate3d(-50%, -50%, 0);
        will-change: transform;
    }



      @keyframes spinner {
        0% {
          transform: translate3d(-50%, -50%, 0) rotate(0deg);
        }
        100% {
          transform: translate3d(-50%, -50%, 0) rotate(360deg);
        }
      }
      span {
        white-space: nowrap;
        display: inline-block;
        overflow: hidden;
        max-width: 200px;
        float: left;
        text-overflow: ellipsis;
      }
      @media only screen and (max-width: 600px) {
        ha-card.preset-card {
          width: 40%;
          padding: 2%;
          margin: 2%;
          height: 30px;
          float: left;
          text-align: center;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        span {
          white-space: nowrap;
          display: inline-block;
          overflow: hidden;
          max-width: 100px;
          float: left;
          text-overflow: ellipsis;
        }
        .discover.spin::before{
        animation: 1.5s linear infinite spinner;
        animation-play-state: inherit;
        border: solid 5px #cfd0d1;
        border-bottom-color: var(--primary-background-color);
        border-radius: 50%;
        border-width: 10%;
        content: "";
        height: 20px;
        width: 20px;
        position: absolute;
        left: 250px;
        top: 92px;
        transform: translate3d(-50%, -50%, 0);
        will-change: transform;
      }
      }

      .box {
        padding-top: 30px;
      }
      #box {
        margin-bottom: 50px;
        padding-top: 30px;
      }
      .div-options {
        width: 100%;
        display: flex;
        flex-wrap: wrap;
        padding: 8px 8px 8px;
        justify-content: space-between;
        align-items: flex-end;
        flex-direction: column;
      }
      #current {
        margin-top: 50px;
        margin-left: 3%;
        font-weight: 450;
        font-size: 1.2rem;
      }
      .actions {
        display: flex;
        flex-direction: row;
        margin-top: 2%;
      }
      #button-cancel {
        --mdc-theme-primary: grey;
      }
    `;
  }
}
