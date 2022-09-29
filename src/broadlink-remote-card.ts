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
import { customElement, eventOptions, property, queryAsync, state } from "lit/decorators";
import {
  HomeAssistant,
  hasConfigOrEntityChanged,
  LovelaceCardEditor,
  getLovelace,
} from 'custom-card-helpers';
import { fetchDevicesMac } from "./helpers"
import './editor';
import type { RemoteCardConfig } from './types';
import { CARD_VERSION, mdiIcon, UNAVAILABLE_STATES } from './const';
import { localize } from './localize/localize';
import { RippleHandlers } from '@material/mwc-ripple/ripple-handlers';
import { Ripple } from '@material/mwc-ripple';
import { showBroadlinkDialog } from './show-more-info-dialog';

/* eslint no-console: 0 */
console.info(
  `%c  REMOTE-CARD \n%c  ${localize('common.version')} ${CARD_VERSION}    `,
  'color: orange; font-weight: bold; background: black',
  'color: white; font-weight: bold; background: dimgray',
);

(window as any).customCards = (window as any).customCards || [];
(window as any).customCards.push({
  type: 'remote-card',
  name: localize('info.card_name'),
  description: localize('info.description'),
  preview: true,
});

declare global {
  // for fire event
  interface HASSDomEvents {
    "add-remote": { broadlinkInfo: RemoteCardConfig , all_devices: any};
  }
}

@customElement('remote-card')
export class RemoteCard extends LitElement {
  public static async getConfigElement(): Promise<LovelaceCardEditor> {
    return document.createElement('remote-card-editor');
  }

  @property({ attribute: false }) public hass!: HomeAssistant;

  @property({ attribute: false }) learningOn = false;

  @property({ attribute: false }) quickLearning = false;

  @property({ attribute: false }) learningLock = false;

  @property({ attribute: false }) buttonBeingLearned = "none";

  @property({ attribute: false }) public config!: RemoteCardConfig;

  @state() private _shouldRenderRipple = false;

  @queryAsync("mwc-ripple") private _ripple!: Promise<Ripple | null>;

  @property({ type: String }) public layout = "big";

  protected async firstUpdated(): Promise<void> {
    window.addEventListener("add-remote", (ev: any) => {
      this.config.preset = ev.detail.broadlinkInfo.name
    });
  }

  public static async getStubConfig(hass: HomeAssistant): Promise<Record<string, unknown>> {
    const Devices = await fetchDevicesMac(hass).then((resp) => { return resp })
    if (Devices.length === 0) {
      return {
        type: "custom:remote-card",
        all_devices: []
      };
    }
    return {
      type: "custom:remote-card",
      show_name: true,
      selected_device_mac: Devices[0].mac,
      all_devices: Devices.map((device) => ({ mac: device.mac, device_type: device.device_type, presets: device.presets, is_locked: device.is_locked })),
      preset: "",
    };

  }

  public setConfig(config: RemoteCardConfig): void {
    if (!config) {
      throw new Error(localize('common.invalid_configuration'));
    }

    if (config.test_gui) {
      getLovelace().setEditMode(true);
    }

    this.config = {
      ...config,
      preset: String(config.preset)
    }
  }

  protected shouldUpdate(changedProps: PropertyValues): boolean {
    if (!this.config) {
      return false;
    }
    return hasConfigOrEntityChanged(this, changedProps, true);
  }

  protected render(): TemplateResult | void {
    this.config.icon = mdiIcon

    if (this.config.show_warning || !(this.config.selected_device_mac)) {
      return this._showWarning(localize('common.show_warning'));

    }

    if (this.config.show_error) {
      return this._showError(localize('common.show_error'));
    }
    let index = 0;
    if (this.config?.all_devices) {
      for (let i = 0; i < this.config?.all_devices?.length; i++) {
        if (this.config?.all_devices[i].mac === this.config?.selected_device_mac) {
          index = i
        }
      }
    }
    const states = this.config?.all_devices[index].is_locked

    return html`
     <ha-card
      class=${classMap({
        "big-card": this.layout === "big",
        "small-card": this.layout === "small",
        "medium-card": this.layout === "medium",
        "unavailable": states === true
              })}
        @focus=${this.handleRippleFocus}
        @blur=${this.handleRippleBlur}
        @mousedown=${this.handleRippleActivate}
        @mouseup=${this.handleRippleDeactivate}
        @touchstart=${this.handleRippleActivate}
        @touchend=${this.handleRippleDeactivate}
        @touchcancel=${this.handleRippleDeactivate}
        @click=${this._showBroadlinkDialog}
        role="button"

      >
        <ha-state-icon class=${classMap({
        "ha-status-icon-big": this.layout === "big",
        "ha-status-icon-small": this.layout === "medium" ||  this.layout === "small",
              })} .icon=${"broadcast"} >
        </ha-state-icon>
        ${this.config.preset !== "undefined"
          ? html`<span class=${classMap({
            "rect-card": this.layout === "big",
            "rect-card-small": this.layout === "small",
            "rect-card-medium": this.layout === "medium"
                  })} tabindex="-1" .title=${this.config.preset ? this.config.preset : ""}
              >${this.config.preset}</span
            >`
          : ""}
        ${this._shouldRenderRipple ? html`<mwc-ripple></mwc-ripple>` : ""}
        ${states
          ? html` <unavailable-icon></unavailable-icon>`
          : html``}
      </ha-card>
    `;
  }


  private _rippleHandlers: RippleHandlers = new RippleHandlers(() => {
    this._shouldRenderRipple = true;
    return this._ripple;
  });

  private _showBroadlinkDialog() {
    showBroadlinkDialog(
      this,
      { broadlinkInfo: this.config }
    )
  }

  @eventOptions({ passive: true })
  private handleRippleActivate(evt?: Event) {
    this._rippleHandlers.startPress(evt);
  }

  private handleRippleDeactivate() {
    this._rippleHandlers.endPress();
  }

  private handleRippleFocus() {
    this._rippleHandlers.startFocus();
  }

  private handleRippleBlur() {
    this._rippleHandlers.endFocus();
  }

  private _showWarning(error_message:string): TemplateResult {
    return html`
      <hui-warning>${error_message}</hui-warning>
    `;
  }

  private _showError(error: string): TemplateResult {
    const errorCard = document.createElement('hui-error-card');
    errorCard.setConfig({
      type: 'error',
      error,
      origConfig: this.config,
    });

    return html`
      ${errorCard}
    `;
  }

  static get styles(): CSSResultGroup {
    return css`
      .small-card {
        cursor: pointer;
        display: flex;
        flex-direction: column;
        align-items: left;
        text-align: left;
        padding: 4% 0;
        font-size: 1.2rem;
        height: 100%;
        box-sizing: border-box;
        justify-content: center;
        position: relative;
        overflow: hidden;
        border-radius: 1.5rem;
        font-weight: 450;
        /* aspect-ratio: 1; */
      }
      .medium-card {
        cursor: pointer;
        display: flex;
        flex-direction: column;
        align-items: left;
        text-align: left;
        padding: 4% 0;
        font-size: 1.8rem;
        height: 100%;
        box-sizing: border-box;
        justify-content: center;
        position: relative;
        overflow: hidden;
        border-radius: 1.5rem;
        font-weight: 450;
        /* aspect-ratio: 1; */
      }
      .big-card {
        cursor: pointer;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        padding: 4% 0;
        font-size: 2.3rem;
        height: 100%;
        box-sizing: border-box;
        justify-content: center;
        position: relative;
        overflow: hidden;
        border-radius: 1.5rem;
        font-weight: 450;
      }
      .unavailable {
        pointer-events: none;
      }
      unavailable-icon {
        position: absolute;
        top: 11px;
        right: 10%;
      }
      .rect-card-small {
        padding: 5%;
        padding-bottom: 4%;
        margin-bottom: 4%;
        margin-left: 7%;
        white-space: nowrap;
        display: inline-block;
        overflow: hidden;
        max-width: 110px;
        text-overflow: ellipsis;
      }

      .rect-card-medium {
        padding: 5%;
        padding-bottom: 4%;
        margin-bottom: 4%;
        margin-left: 7%;
        white-space: nowrap;
        display: inline-block;
        overflow: hidden;
        max-width: 200px;
        text-overflow: ellipsis;
      }

      .rect-card {
        padding: 5%;
        white-space: nowrap;
        overflow: hidden;
        max-width: 350px;
        text-overflow: ellipsis;
      }

      ha-card:focus {
        outline: none;
      }

      .ha-status-icon-big {
        width: 40%;
        height: auto;
        color: var(--paper-item-icon-color, #7b7b7b);
        --mdc-icon-size: 100%;
      }

      .ha-status-icon-small {
        width: 63%;
        margin-left: 5%;
        height: auto;
        color: var(--paper-item-icon-color, #7b7b7b);
        --mdc-icon-size: 100%;
      }
      .svg-icon {
        fill: var(--paper-item-icon-color, #44739e);
      }

      ha-state-icon,
      span {
        outline: none;
      }
      unavailable-icon {
        position: absolute;
        top: 11px;
        right: 10%;
      }
      .state {
        font-size: 0.9rem;
        color: var(--secondary-text-color);
      }
    `;
  }
}
