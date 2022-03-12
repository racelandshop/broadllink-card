/* eslint-disable @typescript-eslint/no-explicit-any */


import { LitElement, html, TemplateResult, css, CSSResultGroup, PropertyValues} from 'lit';
import { HomeAssistant, fireEvent, LovelaceCardEditor, ActionHandlerEvent, ActionConfig, hasAction, } from 'custom-card-helpers';
import { actionHandler } from "./action-handler-directive";
import { RemoteCardConfig } from './types';
import { customElement, property, state } from 'lit/decorators';
import { classMap } from "lit/directives/class-map";
import { localize } from './localize/localize';
import { discoverDevices } from './helpers'
import { remoteConfigSchema } from './schema'

@customElement('remote-card-editor')
export class RemoteCardEditor extends LitElement implements LovelaceCardEditor {
  @property({ attribute: false }) public hass?: HomeAssistant;

  @state() private _config?: RemoteCardConfig;

  @state() private _toogle?: boolean;

  @state() private _helpers?: any;

  @property({ attribute: false }) preset?: string

  @property( { attribute: false } ) _discovering?: boolean;

  private _initialized = false;

  public setConfig(config: RemoteCardConfig): void {
    this._config = config;
    this.preset = this._config.preset
    this._discovering = false;
    this.loadCardHelpers();
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

  get _entity(): string {
    return this._config?.entity || '';
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
      return html``;
    }

    const remoteTypeConfigSchemaData = {
      "selected_device_mac": this._config?.selected_device_mac,
      "remote_type": this._config?.remote_type
    }

    return html`
      <div class="card-config">
        <ha-card class=${classMap({"spin": this._discovering === true})}
          @action=${this._handleAction}
          .actionHandler=${actionHandler({ hasHold: hasAction() })}>
              ${localize('editor.discover')}
        </ha-card>


        <div class="box">
          <ha-form
            .hass=${this.hass}
            .data=${remoteTypeConfigSchemaData}
            .schema=${remoteConfigSchema(this._config)}
            .computeLabel=${(s) => s.label ?? s.name}
            @value-changed=${this._changeCardOptions}
          ></ha-form>
        </div>

        <div class= "div-options">
          ${this._config?.selected_device_mac !== '' ? ['1', '2', '3', '4', '5', '6'].map((preset) =>
            html `
            <ha-card class = "preset-card ${classMap({
                "on": this.preset === preset,
                "off": this.preset !== preset})}"
                @action=${this._changePreset.bind(this, preset)}
                .actionHandler=${actionHandler({ hasHold: hasAction() })}>
                ${preset}
            </ha-card>`
          ) : html``
        }
        </div class= "div-options">
      </div class = "card-config">

    `;
  }

  private _initialize(): void {
    if (this.hass === undefined) return;
    if (this._config === undefined) return;
    if (this._helpers === undefined) return;
    this._initialized = true;
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
      if (this._config?.all_devices) {
        this._config.all_devices = Devices;
        if (!(this._config.all_devices.map(device => device.mac).includes(this._config.selected_device_mac))) {
          this._config.selected_device_mac = "";
          delete this._config.preset;
          delete this._config.remote_type;
          fireEvent(this, "config-changed", { config: this._config });
        } else {
          fireEvent(this, 'config-changed', { config: this._config });
        }

      }

    }
  }

  private _changePreset(key:string): void {
    if (!this._config || !this.hass) {
      return;
    }
    this._config = { ...this._config, preset: key }
    this.preset = key
    fireEvent(this, 'config-changed', { config: this._config });
  }

  private _changeCardOptions(ev): void {
    if (!this._config || !this.hass) {
      return;
    }
    const newData = ev.detail.value;
    if (newData) {
      console.log("the new data", newData)
      this._config = { ...this._config, ...newData }
      this.dispatchEvent(
        new CustomEvent("config-changed", { detail: { config: this._config } })
      );
    }

    //if (target.select === localize('editor.no_broadlinks')) {
    //  return
    //}TODO: remote no broadlink options and features in the card editor
  }


  private _formatDeviceDropdownOption(device):string {
    return device.device_type + " ("  + device.mac + ")"
  } //TODO deprecated, remove OR add to the helpers functions and import into the schema


  private _valueChanged(ev): void {
    if (!this._config || !this.hass) {
      return;
    }
    const target = ev.target;
    if (this[`_${target.configValue}`] === target.selected) {
      return;
    }
    if (target.select === localize('editor.no_broadlinks')) {
      return
    }

    if (target.configValue) {
      if (target.selected === '') {
        const tmpConfig = { ...this._config };
        delete tmpConfig[target.configValue];
        this._config = tmpConfig;
      } else {
        this._config = {
          ...this._config,
          [target.configValue]: target.checked !== undefined ? target.checked : target.selected,
        };
      }
    }
    fireEvent(this, 'config-changed', { config: this._config });
  }


  static get styles(): CSSResultGroup {
    return css`
      ha-card{
        width: 40%;
        height: 30%;
        background-color: var(--primary-background-color);
        box-shadow: -2px -2px 5px #2c2c2c , 2px 2px 5px #191919;
        cursor: pointer;
      }
      ha-card.preset-card{
        width: 15%;
        padding: 2%;
        margin: 5%;
        float: left;
        text-align: center;
      }

      ha-card.preset-card.on{
        color: #FFA500;
        box-shadow: -1px -1px 3px #FFA500 , 1px 1px 3px #FFA500;
      }

      ha-card.spin::before{
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
        top: 50%;
        left: 83%;
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
      .option {
        padding: 4px 0px;
        cursor: pointer;
      }
      .row {
        display: flex;
        margin-bottom: -14px;
        pointer-events: none;
      }
      .title {
        padding-left: 16px;
        margin-top: -6px;
        pointer-events: none;
      }
      .secondary {
        padding-left: 40px;
        color: var(--secondary-text-color);
        pointer-events: none;
      }
      .values {
        padding-left: 16px;
        background: var(--secondary-background-color);
        display: grid;
      }
      ha-formfield {
        padding-bottom: 8px;
      }
    `;
  }
}
