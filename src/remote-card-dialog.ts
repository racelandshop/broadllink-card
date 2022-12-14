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
  hasConfigOrEntityChanged,
  getLovelace,
  fireEvent,
} from 'custom-card-helpers';

import { learningMode } from "./webhook"


import './editor';
import type { RemoteCardConfig } from './types';
import { localize } from './localize/localize';
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
        --mdc-dialog-max-height: 800px !important;
    }
    ha-dialog .form {
        padding-bottom: 24px;
        color: var(--primary-text-color);
    }
    a {
        color: var(--accent-color) !important;
    }
    ha-dialog > .mdc-dialog__surface {
        height: 100%;
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


@customElement('remote-card-dialog')
export class HuiMoreInfoBroadlink extends LitElement  {


  @property({ attribute: false }) public hass!: HomeAssistant;

  @property({ attribute: false }) learningOn = false;

  @property({ attribute: false }) quickLearning = false;

  @property({ attribute: false }) learningLock = false;

  @property({ attribute: false }) buttonBeingLearned = "none";

  @state() private config!: RemoteCardConfig;

  @state() private _params?: BroadlinkDialogParams;

  @state() private broadlinkInfo: any;

  @state() private obj: any;

  @state() private remoteType: any;

  @property({ attribute: false }) public stateObj!: any;

  @property({ attribute: false }) show_animation: boolean | undefined;

  @property({ attribute: false }) show_animation_remote: boolean | undefined;

  @property({ attribute: false }) _show_inputs: boolean | undefined;

  @property({ attribute: false }) _show_sound_output: boolean | undefined;

  @property({ attribute: false }) _show_text: boolean | undefined;

  @property({ attribute: false }) _show_keypad: boolean | undefined;

  @state() private _currTabIndex = 0;

  public async showDialog(params: BroadlinkDialogParams): Promise<void> {
    this._params = params;
    this.broadlinkInfo = this._params.broadlinkInfo;
    this.obj = this._params.obj
    this.config = this.broadlinkInfo;
    this.show_animation = false;
    this._show_sound_output = false;
    this._show_inputs = false;
    this._show_keypad = false;
    this.show_animation_remote = false;
    this.stateObj = this.obj;
  }

  public closeDialog() {
    this._params = undefined;
    fireEvent(this, "dialog-closed", { dialog: this.localName });
  }

  protected async firstUpdated(changedProps) {
    super.firstUpdated(changedProps);
    fireEvent(this, 'config-changed', { config: this.config });
    document.getElementById('bar')?.click();
    console.log("clicked")
  }


  public setConfig(config: RemoteCardConfig): void {
    if (!config) {
      throw new Error(localize('common.invalid_configuration'));
    }

    if (config.test_gui) {
      getLovelace().setEditMode(true);
    }
  }

  protected shouldUpdate(changedProps: PropertyValues): boolean {
    if (!this.config) {
      return false;
    }
    return hasConfigOrEntityChanged(this, changedProps, true);
  }

  public static get disneyIcon(): TemplateResult | void {
    return html`<svg version="1.1" id="Livello_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
          viewBox="0 0 30 30" style="enable-background:new 0 0 30 30;" xml:space="preserve">
          <style type="text/css">
          .st0{fill:var(--remote-text-color);}
          </style>
          <g transform="translate(0.000000,168.000000) scale(0.100000,-0.100000)">
          <path class="st0" d="M192.9,1646.8c-2.4-1.6-2.1-9.3,0.7-18.7c1-3.1-0.2-4.2-8.7-7.7c-8.7-3.5-9.8-4.5-9.3-8.6
          c0.7-5.8,5.9-6.8,15.5-3c3.8,1.6,7.2,2.8,7.5,2.8c0.5,0,2.1-4,3.7-8.7c3.3-10.1,7.5-13.3,12.4-9.8c3,2.3,3,3.3,1.2,10.1
          c-1,4-2.4,8.7-3.1,10.3c-0.7,2.1,1,3.5,7.3,5.8c12.2,4.4,13.6,5.4,13.6,10c0,5.4-6.6,6.5-17.8,2.6c-4.5-1.6-8.2-2.8-8.4-2.8
          s-1.4,3.3-2.4,7.5C201.6,1647.8,198.7,1650.4,192.9,1646.8z"/>
          <path class="st0" d="M97.2,1581.1c-19.7-5.4-30.2-13.4-30.2-23.1c0-5.9,1.4-6.6,7.9-4c3.3,1.2,3.3,1.4-0.9,3.1l-4.4,1.6l5.8,3.5
          c10.7,6.5,29.9,9.8,51.5,8.7c22.2-1,35.4-4,51.9-12c20.1-9.8,34.9-28.8,34.9-44.9c0-6.8-6.6-18.7-13.3-23.7
          c-13.1-10-34.9-17.3-38.6-12.7c-1,1.2-3.8,8.6-6.3,16.2c-2.4,7.7-4.9,15.4-5.6,16.9c-1.6,4,9.6,7,23.2,6.3l10-0.5l-0.5-5.6
          c-0.7-7,3.1-7.9,7.3-1.9c4.2,5.8,3.5,12.4-1.7,17.3c-3.8,3.5-6.1,4.2-16.1,4.2c-6.5,0-15-0.7-19-1.4l-7.5-1.6l-4,9.4
          c-2.3,5.1-5.9,10.8-8,12.6c-3.7,3.3-3.7,3.3-3.7-1.9c0-2.8,0.9-9.8,2.1-15.4l1.9-10.1l-5.1-3.5c-11.9-8.4-19.9-18.2-19.9-23.7
          c0-8.9,12.4-18.5,32.8-25.7c6.8-2.3,10.1-4.7,12.6-8.9c1.9-3.1,4.2-5.8,5.1-5.8c4.2,0,7.2,2.4,7.2,6.1c0,3.5,1.2,4.2,10.3,5.8
          c30.2,5.4,51.2,28.5,48.5,53.8c-2.3,22.5-19.6,40.5-50.6,53.1C149.2,1583.4,117.8,1586.5,97.2,1581.1z M142.4,1493.4l4.4-15.4
          l-5.8-0.5c-6.5-0.5-24.4,7.5-27.6,12.2c-1.4,2.3-1,3.8,1.6,6.6c3.5,4,17.6,12,21.1,12.2C137.2,1508.6,140,1501.8,142.4,1493.4z"/>
          </g>
          </svg>
 `;
}

public static get amazonPrimeIcon(): TemplateResult | void {
    return html`<svg version="1.1" id="Livello_1" class="prime" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
          viewBox="0 0 90 50" style="enable-background:new 0 0 30 30;" xml:space="preserve">
          <style type="text/css">
          .st0{fill:var(--remote-text-color);}
          </style>
          <!-- <g transform="(0.100000,-0.100000)"> -->
          <path class="st0" d="M1.15,29.2c-0.215,0.01-0.426-0.061-0.59-0.2c-0.14-0.167-0.205-0.384-0.18-0.6V8
            C0.355,7.784,0.42,7.567,0.56,7.4c0.166-0.126,0.372-0.186,0.58-0.17h2.22C3.78,7.188,4.158,7.483,4.22,7.9l0.22,0.8
            c0.639-0.617,1.394-1.103,2.22-1.43c0.845-0.342,1.748-0.519,2.66-0.52c1.818-0.06,3.556,0.749,4.68,2.18
            c1.238,1.706,1.853,3.785,1.74,5.89c0.034,1.528-0.259,3.045-0.86,4.45c-0.496,1.17-1.302,2.183-2.33,2.93
            c-0.994,0.678-2.177,1.028-3.38,1c-0.817,0.004-1.629-0.131-2.4-0.4c-0.709-0.238-1.364-0.612-1.93-1.1v6.72
            c0.022,0.214-0.038,0.429-0.17,0.6c-0.171,0.132-0.386,0.192-0.6,0.17L1.15,29.2z M7.88,19.84c0.988,0.071,1.944-0.371,2.53-1.17
            c0.623-1.118,0.905-2.394,0.81-3.67c0.096-1.288-0.182-2.576-0.8-3.71c-0.588-0.807-1.554-1.25-2.55-1.17
            c-1.057,0.001-2.093,0.287-3,0.83V19c0.9,0.56,1.94,0.854,3,0.85L7.88,19.84z"/>
        <path class="st0" d="M19.54,22.88c-0.358,0.067-0.703-0.169-0.77-0.528c-0.015-0.08-0.015-0.162,0-0.242V8
            c-0.025-0.216,0.04-0.433,0.18-0.6c0.166-0.126,0.372-0.186,0.58-0.17h2.21c0.42-0.042,0.798,0.253,0.86,0.67L23,9.54
            c0.657-0.769,1.442-1.419,2.32-1.92c0.716-0.375,1.512-0.57,2.32-0.57h0.43c0.217-0.019,0.434,0.041,0.61,0.17
            c0.14,0.167,0.205,0.384,0.18,0.6v2.58c0.017,0.208-0.043,0.414-0.17,0.58c-0.167,0.14-0.384,0.205-0.6,0.18h-0.55
            c-0.227,0-0.513,0-0.86,0c-0.578,0.012-1.154,0.079-1.72,0.2c-0.59,0.109-1.166,0.28-1.72,0.51v10.25
            c0.016,0.208-0.044,0.414-0.17,0.58c-0.167,0.14-0.384,0.205-0.6,0.18L19.54,22.88z"/>
        <path class="st0" d="M33.29,4.79c-0.682,0.034-1.351-0.195-1.87-0.64c-0.482-0.451-0.741-1.091-0.71-1.75
            c-0.034-0.663,0.225-1.307,0.71-1.76c1.096-0.877,2.654-0.877,3.75,0c0.482,0.451,0.741,1.091,0.71,1.75
            c0.031,0.659-0.228,1.299-0.71,1.75C34.65,4.591,33.977,4.824,33.29,4.79z M31.82,22.89c-0.358,0.067-0.703-0.169-0.77-0.528
            c-0.015-0.08-0.015-0.162,0-0.242V8c-0.025-0.216,0.04-0.433,0.18-0.6c0.166-0.126,0.372-0.186,0.58-0.17h2.95
            c0.214-0.022,0.429,0.038,0.6,0.17c0.132,0.171,0.192,0.386,0.17,0.6v14.12c0.017,0.208-0.043,0.414-0.17,0.58
            c-0.167,0.14-0.384,0.205-0.6,0.18L31.82,22.89z"/>
        <path class="st0" d="M40.1,22.88c-0.358,0.067-0.703-0.169-0.77-0.528c-0.015-0.08-0.015-0.162,0-0.242V8
            c-0.025-0.216,0.04-0.433,0.18-0.6c0.166-0.126,0.372-0.186,0.58-0.17h2.21c0.42-0.042,0.798,0.253,0.86,0.67l0.25,0.83
            c0.91-0.627,1.894-1.137,2.93-1.52c0.855-0.298,1.754-0.453,2.66-0.46c1.576-0.135,3.09,0.642,3.9,2
            c0.913-0.628,1.905-1.132,2.95-1.5c0.922-0.307,1.888-0.462,2.86-0.46c1.228-0.074,2.432,0.36,3.33,1.2
            c0.828,0.908,1.254,2.113,1.18,3.34v10.79c0.016,0.208-0.044,0.414-0.17,0.58c-0.167,0.14-0.384,0.205-0.6,0.18h-2.91
            c-0.358,0.067-0.703-0.169-0.77-0.528c-0.015-0.08-0.015-0.162,0-0.242v-9.84c0-1.393-0.623-2.09-1.87-2.09
            c-1.162,0.013-2.307,0.287-3.35,0.8v11.14c0.017,0.208-0.043,0.414-0.17,0.58c-0.167,0.14-0.384,0.205-0.6,0.18h-2.94
            c-0.358,0.067-0.703-0.169-0.77-0.528c-0.015-0.08-0.015-0.162,0-0.242v-9.84c0-1.393-0.623-2.09-1.87-2.09
            c-1.176,0.007-2.334,0.292-3.38,0.83v11.1c0.016,0.208-0.044,0.414-0.17,0.58c-0.167,0.14-0.384,0.205-0.6,0.18L40.1,22.88z"/>
        <path class="st0" d="M73.92,23.34c-2.155,0.141-4.272-0.615-5.85-2.09c-1.443-1.652-2.164-3.813-2-6
            c-0.144-2.267,0.586-4.504,2.04-6.25c1.515-1.564,3.636-2.393,5.81-2.27c1.608-0.096,3.196,0.395,4.47,1.38
            c1.078,0.92,1.672,2.285,1.61,3.7c0.073,1.385-0.588,2.707-1.74,3.48c-1.551,0.886-3.328,1.296-5.11,1.18
            c-1.01,0.012-2.018-0.102-3-0.34c0.006,1.106,0.452,2.164,1.24,2.94c0.933,0.662,2.069,0.977,3.21,0.89
            c0.558,0,1.116-0.037,1.67-0.11c0.762-0.118,1.516-0.279,2.26-0.48h0.18h0.15c0.347,0,0.52,0.237,0.52,0.71v1.41
            c0.019,0.239-0.029,0.478-0.14,0.69c-0.142,0.167-0.33,0.288-0.54,0.35C77.17,23.093,75.55,23.368,73.92,23.34z M72.92,13.71
            c0.787,0.057,1.574-0.109,2.27-0.48c0.478-0.327,0.748-0.882,0.71-1.46c0-1.287-0.767-1.93-2.3-1.93c-1.967,0-3.103,1.207-3.41,3.62
            c0.893,0.171,1.801,0.255,2.71,0.25H72.92z"/>
        <path class="st0" d="M72.31,40.11C63.55,46.57,50.85,50,39.92,50c-14.606,0.078-28.716-5.295-39.57-15.07
            c-0.82-0.74-0.09-1.75,0.9-1.18c12.058,6.885,25.705,10.501,39.59,10.49c10.361-0.055,20.61-2.152,30.16-6.17
            C72.52,37.44,73.76,39,72.31,40.11z"/>
        <path class="st0" d="M76,36c-1.12-1.43-7.4-0.68-10.23-0.34c-0.86,0.1-1-0.64-0.22-1.18c5-3.52,13.23-2.5,14.18-1.32
            s-0.25,9.41-5,13.34c-0.72,0.6-1.41,0.28-1.09-0.52C74.71,43.29,77.08,37.39,76,36z"/>
          <!-- </g> -->
          </svg>
 `;
}

public static get daznIcon(): TemplateResult | void {
    return html`<svg version="1.0" id="Livello_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
          viewBox="0 0 30.7 30.7" style="enable-background:new 0 0 30.7 30.7;" xml:space="preserve">
          <style type="text/css">
          .st0{fill:var(--remote-text-color);}
          </style>
          <g transform="translate(0.500000,321.700000) scale(0.100000,-0.100000)">
          <path class="st0" d="M64.5,3165.6c-0.3-0.2-0.4-17.9-0.4-39.2v-38.9l5.4-5.4l5.4-5.5l-5.4-5.5l-5.4-5.6v-39.2v-39.2h89.5h89.5v39.2
          v39.3l-5.4,5.5l-5.5,5.5l5.5,5.4l5.4,5.4l-0.1,39.2l-0.2,39.2l-88.9,0.2C105,3165.9,64.7,3165.8,64.5,3165.6z M234.2,3123.8l0.1-33
          l-7.2-7.3l-7.2-7.3l7.2-7.3l7.2-7.2v-33v-33l-80.6,0.1l-80.6,0.2l-0.2,32.9l-0.1,32.9l7.3,7.3l7.4,7.4l-7.4,7.4l-7.3,7.3v32.6
          c0,17.9,0.2,32.8,0.4,33c0.2,0.3,36.5,0.4,80.6,0.3l80.2-0.2L234.2,3123.8z"/>
          <path class="st0" d="M102.2,3111.8v-24.7h14.9h14.8l5.5,5.5l5.4,5.4v13.8v13.8l-5.4,5.4l-5.5,5.5h-14.8h-14.9V3111.8z
          M131.1,3124.8l3-2.9v-10v-10l-2.9-3l-2.9-3h-8.6h-8.6v15.5c0,8.6,0.2,15.8,0.4,16c0.2,0.3,4.1,0.4,8.6,0.4h8.1L131.1,3124.8z"/>
          <path class="st0" d="M180.6,3135.6c-0.6-1.1-4.3-9.8-13.4-31.8c-2.7-6.5-5.3-12.8-5.8-14s-0.9-2.2-0.9-2.3c0-0.2,2.1-0.3,4.7-0.3
          h4.6l1.4,3.1l1.3,3.1h12.4h12.3l1.3-3.1l1.3-3.1h4.8c3.6,0,4.7,0.2,4.4,0.8c-0.2,0.4-1.3,3-2.5,5.8c-1.9,4.6-4.3,10.3-14.4,34.4
          l-3.4,8.1l-3.8,0.2C181.9,3136.6,181.1,3136.4,180.6,3135.6z M189.4,3112.1l4.1-9.9h-8.7h-8.7l1.3,3c0.7,1.6,2.6,6.3,4.2,10.3
          c1.6,4,3.2,7.1,3.4,6.9C185.2,3122.1,187.2,3117.4,189.4,3112.1z"/>
          <path class="st0" d="M102.5,3064.8c-0.1-0.4-0.2-2.3-0.1-4.3l0.2-3.6l12.7,0.1c6.9,0,12.6-0.1,12.6-0.3c0-0.3-2.3-3.3-5.1-6.7
          c-2.9-3.4-5.9-7.2-6.8-8.3c-0.8-1.1-4.3-5.3-7.6-9.3l-6.1-7.4v-4.3v-4.3h18.8h18.8v4.4v4.4H127h-12.8l1.2,1.8
          c0.7,0.9,6.5,8,12.9,15.8l11.6,14.1l-0.2,4.3l-0.1,4.3l-18.4,0.1C108.1,3065.4,102.7,3065.3,102.5,3064.8z"/>
          <path class="st0" d="M164.4,3065.3c-0.1-0.1-0.3-11.2-0.3-24.6v-24.3h4.4h4.4l0.1,15.8l0.2,15.7l11-15.7l11-15.7l4.9-0.1h4.8v24.3
          c0,13.4-0.1,24.5-0.3,24.6c-0.1,0.1-2.1,0.1-4.4,0.1l-4.1-0.3l-0.1-17l-0.2-17.1l-12.1,17.3l-12,17.3h-3.5
          C166.4,3065.6,164.7,3065.4,164.4,3065.3z"/>
          </g>
          </svg>
 `;
}

public static get nowTv(): TemplateResult | void {
    return html`
          <svg version="1.1" id="Livello_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
          viewBox="0 0 30 30.7" style="enable-background:new 0 0 30 30.7;" xml:space="preserve">
          <style type="text/css">
          .st0{fill:var(--remote-text-color);}
          </style>
          <g transform="translate(1.00000,100.000000) scale(0.100000,-0.100000)">
          <path class="st0" d="M97.6,888.8C84,884,75.1,872.9,73.6,859c-1.5-14.5,8.8-30.3,22.9-35.1c7-2.4,19.6-1.5,25.9,1.8
          c6.5,3.3,12.7,9.7,15.7,16c2.1,4.5,2.5,6.6,2.5,14.3c0,7.8-0.4,9.8-2.6,14.5C131.2,885.4,112.2,893.9,97.6,888.8z"/>
          <path class="st0" d="M58.1,888.2c-4.9-1.5-6.6-4.8-9.1-16.3l-2.2-10.5L38.6,874c-4.5,6.9-9.1,13-10.1,13.6
          c-4.9,2.7-13.4,0.1-14.8-4.5c-1.2-3.8-10.1-48.4-10.1-50.6c0-1.3,1.3-3.6,3.2-5.5c4.3-4.3,9.7-4.6,13.9-0.6c2.5,2.2,3.2,4,5.1,12.8
          c1.1,5.5,2.4,10.4,2.7,10.8c0.4,0.3,3.5-4.1,7.1-9.7c9-14.1,11.3-16.5,16.3-16.5c4.8,0,8.4,2.6,9.8,7c1.8,5.4,9.7,44.9,9.7,48.4
          C71.4,885.7,64.6,890.4,58.1,888.2z"/>
          <path class="st0" d="M246,888.9c-0.9-0.2-1.9-1.3-2.3-2.4c-0.9-2.8,1.8-4.6,7-4.6h4l0.3-12.6l0.3-12.7h2.9h2.9l0.3,12.7l0.3,12.7
          l4.3-0.3l4.4-0.3l5-12.4c4.4-11.2,5.2-12.4,7.4-12.7c2.4-0.3,2.8,0.4,8.5,14.5c3.2,8.2,5.6,15.6,5.4,16.4c-0.4,1-1.4,1.3-3.2,1.1
          c-2.4-0.3-3.1-1.2-6.4-9.7c-2.1-5.1-4.1-9-4.5-8.6c-0.3,0.5-2,4.4-3.6,8.9c-1.7,4.5-3.8,8.7-4.7,9.4
          C272.7,889.5,250,889.9,246,888.9z"/>
          <path class="st0" d="M148.5,886.3c-1.3-1.2-2.8-3.5-3.2-5.1c-0.9-3.2,4.8-44.8,6.9-50.7c1.7-4.6,5.1-6.9,10.2-6.9
          c4.8,0,7.3,2.5,16.5,16.7c4.6,7.1,8.5,12.7,8.7,12.5c0.2-0.1,2.3-5.8,4.6-12.6c5-14.3,6.9-16.6,13.4-16.6c3,0,4.9,0.6,6.6,2.2
          c1.3,1.1,7.6,12.6,14.1,25.5c13.5,26.9,14.1,29.6,8.6,34.5c-3.6,3.2-9.7,3.8-13.4,1.2c-1.1-0.8-4.8-6.7-8-13.1l-5.7-11.6l-3.6,10.2
          c-4.9,13.9-6.5,15.9-13.2,16c-2.3,0-5-0.4-5.9-1c-1-0.5-5.1-6.1-9.3-12.5l-7.5-11.6l-1.1,7.8c-1.5,11-1.9,12.3-4.8,14.9
          c-1.9,1.7-3.5,2.3-7,2.3C152,888.6,150.4,888,148.5,886.3z"/>
          </g>
          </svg>
 `;
}

public static get tvoptic(): TemplateResult | void {
    return html`<svg version="1.1" id="Livello_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
          viewBox="0 0 567 171" style="enable-background:new 0 0 567 171;" xml:space="preserve">
          <style type="text/css">
          .st0{fill:var(--remote-text-color);}
          </style>
          <g transform="translate(0.000000,161.000000) scale(0.100000,-0.100000)">
          <path class="st0" d="M1408,1423l-188-188l-103,103c-108,108-136,122-170,84s-22-62,85-169l103-103H866c-303,0-316-3-367-73l-29-40
          V630c0-407,0-407,23-441c12-18,38-44,56-56l34-23h637h637l34,23c18,12,44,38,56,56c23,34,23,34,23,441v407l-29,40
          c-51,70-64,73-367,73h-268l192,193c106,106,192,200,192,208c0,30-30,59-63,59C1599,1610,1573,1588,1408,1423z M1417,1006
          c61-19,106-66,125-128c8-29,13-112,13-248c0-235-11-287-70-338c-56-49-110-57-410-57c-301,0-354,7-411,57s-69,110-69,338
          c1,384,27,403,540,395C1308,1022,1378,1018,1417,1006z M1809,845c16-8,31-22,35-30c33-86-56-160-127-105c-48,38-41,110,13,137
          C1762,863,1775,863,1809,845z M1809,615c75-38,43-155-42-155s-113,119-37,157C1762,633,1775,633,1809,615z"/>
          <path class="st0" d="M2780,880V770h-110h-110v-75v-75h110h110V510V400h80h80v110v110h110h110v75v75h-110h-110v110v110h-80h-80V880z
          "/>
          <path class="st0" d="M3896,349.1l-45.7-46.6l51.9-52.8c29-29,56.3-52.8,61.6-52.8c5.3,0,28.1,19.3,51,42.2l42.2,43.1l-57.2,57.2
          l-57.2,57.2L3896,349.1z"/>
          <path class="st0" d="M4628.5,1327.9l-64.2-65.1l-32.5,13.2c-43.1,18.5-124.9,17.6-153.9-2.6c-73.9-47.5-64.2-163.6,25.5-307.8
          c109-174.1,319.2-328.9,427.4-315.7c36.1,5.3,87.1,40.5,107.3,73.9c18.5,31.7,19.3,91.5,1.8,141.6c-15,43.1-22,30.8,68.6,125.8
          c35.2,37.8,41.3,49.2,41.3,80c0,29.9-6.2,41.3-36.9,73l-36.9,37.8l22,23.7c36.1,38.7,51.9,66.8,51.9,88.8
          c0,51-62.4,106.4-107.3,95.9c-11.4-3.5-39.6-21.1-61.6-40.5l-39.6-35.2l-38.7,39.6c-32.5,33.4-43.1,38.7-73.9,38.7
          C4696.2,1393,4687.4,1387.7,4628.5,1327.9z M4781.5,1305.9c23.7-26.4,24.6-26.4,9.7-57.2c-20.2-44-17.6-61.6,15.8-96.7
          c23.7-25.5,36.1-31.7,62.4-31.7c19.3,0,40.5,6.2,50.1,15c15,14.1,17.6,13.2,46.6-15c16.7-16.7,30.8-37.8,30.8-47.5
          c0-9.7-15-32.5-32.5-51l-32.5-33.4l-143.3,142.5l-143.3,142.5l28.1,29C4710.3,1340.2,4746.4,1341.1,4781.5,1305.9z M4986.4,1320.9
          c20.2-20.2,10.6-39.6-45.7-93.2c-56.3-54.5-69.5-60.7-91.5-46.6c-26.4,16.7-16.7,40.5,36.1,95.9
          C4939,1331.4,4964.5,1342.9,4986.4,1320.9z M4675.1,1172.3l61.6-61.6l-49.2-49.2l-49.2-49.2l-64.2,63.3l-64.2,63.3l47.5,47.5
          c26.4,26.4,50.1,48.4,52.8,48.4C4612.7,1234.7,4641.7,1206.6,4675.1,1172.3z M4844.9,902.3l-45.7-45.7l-61.6,61.6l-61.6,61.6
          l46.6,46.6l46.6,47.5l60.7-62.4l60.7-62.4L4844.9,902.3z"/>
          <path class="st0" d="M4122,921.6c-92.3-133.7-163.6-246.2-172.4-271.7c-41.3-119.6,33.4-276.1,164.5-343
          c44.8-22.9,61.6-26.4,122.2-26.4h71.2l80,52.8c232.2,152.1,397.5,264.7,401.9,275.3c2.6,6.2,1.8,9.7-2.6,6.2
          c-15-8.8-118.7,35.2-182,77.4c-34.3,22.9-92.3,72.1-128.4,109.9c-100.3,104.7-144.2,175.9-178.5,286.7l-18.5,60.7L4122,921.6z"/>
          </g>
          </svg>
 `;
}

public static get tvheadphone(): TemplateResult | void {
    return html`
          <svg version="1.1" id="Livello_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
          viewBox="0 0 567 171" style="enable-background:new 0 0 567 171;" xml:space="preserve">
          <style type="text/css">
          .st0{fill:var(--remote-text-color);}
          </style>
          <g transform="translate(0.000000,151.000000) scale(0.090000,-0.090000)">
          <path class="st0" d="M1408,1423l-188-188l-103,103c-108,108-136,122-170,84s-22-62,85-169l103-103H866c-303,0-316-3-367-73l-29-40
          V630c0-407,0-407,23-441c12-18,38-44,56-56l34-23h637h637l34,23c18,12,44,38,56,56c23,34,23,34,23,441v407l-29,40
          c-51,70-64,73-367,73h-268l192,193c106,106,192,200,192,208c0,30-30,59-63,59C1599,1610,1573,1588,1408,1423z M1417,1006
          c61-19,106-66,125-128c8-29,13-112,13-248c0-235-11-287-70-338c-56-49-110-57-410-57c-301,0-354,7-411,57s-69,110-69,338
          c1,384,27,403,540,395C1308,1022,1378,1018,1417,1006z M1809,845c16-8,31-22,35-30c33-86-56-160-127-105c-48,38-41,110,13,137
          C1762,863,1775,863,1809,845z M1809,615c75-38,43-155-42-155s-113,119-37,157C1762,633,1775,633,1809,615z"/>
          <path class="st0" d="M2780,880V770h-110h-110v-75v-75h110h110V510V400h80h80v110v110h110h110v75v75h-110h-110v110v110h-80h-80V880z
          "/>
          <path class="st0" d="M4450,1418.9c-338.9,0-610-271.1-610-610V334.4c0-112.3,91-203.3,203.3-203.3h203.3v542.2h-271.1v135.6
          c0,262,212.4,474.4,474.4,474.4s474.4-212.4,474.4-474.4V673.3h-271.1V131.1h203.3c112.3,0,203.3,91,203.3,203.3v474.4
          C5060,1147.8,4786.9,1418.9,4450,1418.9z"/>
          </g>
          </svg>`;
}

public static get optic(): TemplateResult | void {
    return html`<svg version="1.1" id="Livello_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
          viewBox="0 0 567 171" style="enable-background:new 0 0 567 171;" xml:space="preserve">
          <style type="text/css">
          .st0{fill:var(--remote-text-color);}
          </style>
          <g transform="translate(0.000000,171.000000) scale(0.100000,-0.100000)">
          <path class="st0" d="M2281,410.7l-45.7-46.6l51.9-52.8c29-29,56.3-52.8,61.6-52.8s28.1,19.3,51,42.2l42.2,43.1l-57.2,57.2
          l-57.2,57.2L2281,410.7z"/>
          <path class="st0" d="M3013.5,1389.5l-64.2-65.1l-32.5,13.2c-43.1,18.5-124.9,17.6-153.9-2.6c-73.9-47.5-64.2-163.6,25.5-307.8
          c109-174.1,319.2-328.9,427.4-315.7c36.1,5.3,87.1,40.5,107.3,73.9c18.5,31.7,19.3,91.5,1.8,141.6c-14.9,43.1-22,30.8,68.6,125.8
          c35.2,37.8,41.3,49.2,41.3,80c0,29.9-6.2,41.3-36.9,73l-36.9,37.8l22,23.7c36.1,38.7,51.9,66.8,51.9,88.8
          c0,51-62.4,106.4-107.3,95.9c-11.4-3.5-39.6-21.1-61.6-40.5l-39.6-35.2l-38.7,39.6c-32.5,33.4-43.1,38.7-73.9,38.7
          C3081.2,1454.6,3072.4,1449.3,3013.5,1389.5z M3166.5,1367.5c23.7-26.4,24.6-26.4,9.7-57.2c-20.2-44-17.6-61.6,15.8-96.7
          c23.7-25.5,36.1-31.7,62.4-31.7c19.3,0,40.5,6.2,50.1,15c14.9,14.1,17.6,13.2,46.6-15c16.7-16.7,30.8-37.8,30.8-47.5
          c0-9.7-14.9-32.5-32.5-51l-32.5-33.4l-143.3,142.5L3030.2,1335l28.1,29C3095.3,1401.8,3131.4,1402.7,3166.5,1367.5z M3371.4,1382.4
          c20.2-20.2,10.6-39.6-45.7-93.2c-56.3-54.5-69.5-60.7-91.5-46.6c-26.4,16.7-16.7,40.5,36.1,95.9
          C3324,1393,3349.5,1404.4,3371.4,1382.4z M3060.1,1233.8l61.6-61.6l-49.2-49.2l-49.2-49.2l-64.2,63.3l-64.2,63.3l47.5,47.5
          c26.4,26.4,50.1,48.4,52.8,48.4S3026.7,1268.1,3060.1,1233.8z M3229.9,963.8l-45.7-45.7l-61.6,61.6l-61.6,61.6l46.6,46.6l46.6,47.5
          l60.7-62.4l60.7-62.4L3229.9,963.8z"/>
          <path class="st0" d="M2507,983.2c-92.3-133.7-163.6-246.2-172.4-271.7c-41.3-119.6,33.4-276.1,164.4-343
          c44.9-22.9,61.6-26.4,122.2-26.4h71.2l80,52.8c232.2,152.1,397.5,264.7,401.9,275.3c2.6,6.2,1.8,9.7-2.6,6.2
          c-14.9-8.8-118.7,35.2-182,77.4c-34.3,22.9-92.3,72.1-128.4,109.9c-100.3,104.7-144.2,175.9-178.5,286.7l-18.5,60.7L2507,983.2z"/>
          </g>
          </svg>
     `;
}

public static get arc(): TemplateResult | void {
    return html`<svg version="1.1" id="Livello_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
          viewBox="0 0 567 171" style="enable-background:new 0 0 567 171;" xml:space="preserve">
          <style type="text/css">
          .st0{fill:var(--remote-text-color);}
          </style>
          <g transform="translate(0.000000,150.000000) scale(0.100000,-0.100000)">
          <path class="st0" d="M1826.2,1247c-60-32-71-67-71-229V875h-280h-280V640V405h280h280V269c0-154,10-190,65-224c32-20,48-20,885-20
          h853l34,26c36,27,63,72,56,92c-4,9,37,12,184,12h189l42,85l42,85v323v322l-51,83l-51,82h-174c-158,0-175,2-180,18
          c-12,40-32,68-63,89l-34,23h-846C1905.2,1265,1858.2,1264,1826.2,1247z M3495.2,645V175h-790h-790v470v470h790h790V645z
          M3934.2,956c11-20,16-581,5-618c-6-22-10-23-145-23h-139v330v330h135C3911.2,975,3925.2,973,3934.2,956z M1755.2,650v-75h-200
          h-200v75v75h200h200V650z"/>
          <path class="st0" d="M2412.2,769c-4-4-7-22-7-41v-33h135h135v-55v-55h-85h-85v45v45h-50h-50v-78v-77l163,2c89,2,165,3,169,3
          c19,0,38,64,38,124c0,54-4,70-24,93l-24,28l-154,3C2489.2,775,2416.2,773,2412.2,769z"/>
          <path class="st0" d="M2810.2,762c-3-7-4-65-3-128l3-114l48-3l47-3v95v96h40h40v-95v-95h50h50v95v95h40h39l3-92l3-93l53-3l52-3v98
          c0,88-2,101-24,128l-24,30l-206,3C2854.2,776,2814.2,774,2810.2,762z"/>
          <path class="st0" d="M1995.2,640V515h55h55v45v45h83h82v-42v-43h50h50v120v120l-52,3l-53,3v-50v-51h-80h-80v50v50h-55h-55V640z"/>
          <path class="st0" d="M3305.2,640V515h50h50v125v125h-50h-50V640z"/>
          </g>
          </svg>`;
}

public static get lineout(): TemplateResult | void {
    return html`<svg version="1.1" id="Livello_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
          viewBox="0 0 567 171" style="enable-background:new 0 0 567 171;" xml:space="preserve">
          <style type="text/css">
          .st0{fill:var(--remote-text-color);}
          </style>
          <g transform="translate(0.000000,170.000000) scale(0.100000,-0.100000)">
          <path class="st0" d="M2523.2,1488.7c-10.2-10.2-13.6-31.4-13.6-93.4v-79.8h-50.9h-50.9V1273v-42.5h140.1h140.1v42.5v42.5H2637H2586
          v79.8c0,81.5-9.3,107-38.2,107C2541.9,1502.3,2530,1496.3,2523.2,1488.7z"/>
          <path class="st0" d="M3041.1,1488.7c-10.2-10.2-13.6-31.4-13.6-93.4v-79.8h-50.9h-50.9V1273v-42.5h140.1h140.1v42.5v42.5h-50.9
          H3104v79.8c0,81.5-9.3,107-38.2,107C3059.8,1502.3,3047.9,1496.3,3041.1,1488.7z"/>
          <path class="st0" d="M2356.8,1077.7c0-73,3.4-118.9,8.5-119.7c5.1-0.8,13.6-1.7,19.5-2.5c6.8-0.8,11-24.6,12.7-81.5
          c0.8-44.2,5.9-89.2,11-98.5c11-21.2,41.6-37.4,71.3-37.4c21.2,0,21.2-0.8,21.2-78.1c0.8-165.6,55.2-209.7,321.8-257.3
          c123.1-22.1,180.8-43.3,191-67.9c2.5-7.6,5.1-46.7,5.1-85.8v-71.3h50.9h50.9v280.2c0,272.5,0.8,280.2,17,280.2
          c25.5,0,56.9,17,67.1,37.4c5.1,9.3,10.2,54.3,11,98.5c2.5,76.4,3.4,80.7,22.1,83.2c18.7,2.5,18.7,5.1,18.7,121.4v118h-191h-191
          v-118c0-116.3,0-118.9,19.5-121.4c17.8-2.5,18.7-6.8,20.4-79c1.7-41.6,4.2-84.9,6.8-95.1c5.1-22.1,44.2-45,76.4-45h21.2V598
          c0-77.3-1.7-140.1-3.4-140.1c-1.7,0-17.8,5.1-35.7,11.9c-18.7,5.9-59.4,16.1-92.5,21.2c-208,36.5-259,53.5-280.2,95.1
          c-7.6,14.4-12.7,48.4-12.7,88.3c0,62.8,0,63.7,21.2,63.7c32.3,0,71.3,22.9,76.4,45c2.5,10.2,5.1,53.5,6.8,95.1
          c1.7,72.2,2.5,76.4,21.2,79c18.7,2.5,18.7,5.1,18.7,121.4v118h-191h-191V1077.7z"/>
          </g>
          </svg>
 `;
}

public static get iconMapping() {
    return {
        "disney": this.disneyIcon,
        "dazn": this.daznIcon,
        "nowtv": this.nowTv
    };
}

  protected render(): TemplateResult | void {
    if (this.config.show_warning || !(this.config.entity)) {
      return this._showWarning(localize('common.show_warning'));

    }

    if (this.config.show_error) {
      return this._showError(localize('common.show_error'));
    }

    if (!this._params) {
      return html``;
    }
    let index = 0;
    if (this.config?.all_devices) {
      for (let i = 0; i < this.config?.all_devices?.length; i++) {
        if (this.config?.all_devices[i].mac === this.config?.entity) {
          index = i
        }
      }
    }
    const presets = this.config?.all_devices[index].presets
    const selectec_device_preset_list : any= []
    for (const [preset_name, preset_value] of Object.entries(presets)) {
      selectec_device_preset_list.push(preset_name)
    }
    if (this.config.preset) this.remoteType = this.config.all_devices[index].presets[this.config.preset].type

    const colorButtons = this.config.color_buttons === "enable";

    const borderWidth = this.config.dimensions && this.config.dimensions.border_width ? this.config.dimensions.border_width : "1px";
    const scale = this.config.dimensions && this.config.dimensions.scale ? this.config.dimensions.scale : 1;
    const remoteWidth = Math.round(scale * 260) + "px";

    const backgroundColor = this.config.colors && this.config.colors.background ? this.config.colors.background : "#111111";
    const borderColor = this.config.colors && this.config.colors.border ? this.config.colors.border: "#111111";
    const buttonColor = this.config.colors && this.config.colors.buttons ? this.config.colors.buttons : "var(--raquel-dark-2)";
    const textColor = this.config.colors && this.config.colors.texts ? this.config.colors.texts : "white";
    console.log("button being learned", this.buttonBeingLearned)
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
            <ha-header-bar id="bar">
              <div
                slot="title"
                class="main-title"
                .title=${name}
              >
              ${this.config.preset}
              </div>
              <ha-icon-button
              slot="navigationIcon"
              dialogAction="cancel"
              .label=${this.hass!.localize(
                "ui.dialogs.more_info_control.dismiss")}
              id="cancel"
              .path=${"M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"}
            ></ha-icon-button>
            </ha-header-bar>
            </div>
        </div>
        <div class="content">
          <div class="contentFather">
          <div class="row">
              <button class="learning-button" @click=${() => this._handleAction("LearningMode")}>ENTER LEARNING MODE</button>
            </div>
            <div class="sep"></div>
            <div class=${classMap({
              "learning-on": this.learningOn === true,
              "card": true
                            })}>
                <div class="page" style="--remote-button-color: ${buttonColor}; --remote-text-color: ${textColor}; --remote-color: ${backgroundColor}; --remotewidth: ${remoteWidth};  --main-border-color: ${borderColor}; --main-border-width: ${borderWidth}">
                    <div class="grid-container-power"  style="--remotewidth: ${remoteWidth}">
                        <button class="btn-flat flat-high ripple ${classMap({
                        "learning-on-button": this.buttonBeingLearned === "ChannelList"
                            })}" @click=${() => this._handleAction("ChannelList")}><ha-icon icon="mdi:format-list-numbered"/></button>
                        <button class="btn ripple ${classMap({
                        "learning-on-button": this.buttonBeingLearned === "Power"
                            })}" @click=${() => this._handleAction('Power')}><ha-icon icon="mdi:power" style="color: red;"/></button>
                        <button class="btn-flat flat-high ripple" @click=${this._showAnimation}>123</button>
                    </div>
                    <div class=${classMap({
                        "buttons": this.show_animation_remote === true
                            })}>
                        ${this._show_sound_output ? html`
        <!-- ################################# SOUND ################################# -->
                            <div id="spacer">
                                <div class="grid-container-sound">
                                    <div class="shape-sound">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 260"><path d="m 13 43 a 30 30 0 0 0 60 0 a 30 30 0 0 0 -60 0 M 130 12 h 88 a 30 30 0 0 1 30 30 v 188 a 30 30 0 0 1 -30 30 h -176 a 30 30 0 0 1 -30 -30 v -117 a 30 30 0 0 1 30 -30 a 40 40 0 0 0 41 -41 a 30 30 0 0 1 30 -30 z " fill="var(--remote-button-color)" stroke="#000000" stroke-width="0" /></svg>
                                    </div>
                                    <button class="bnt-sound-back ripple"  @click=${() => this._show_sound_output = false}><ha-icon icon="mdi:undo-variant"/></button>
                                    ${this._show_text ? html`
                                        <button class="btn_soundoutput ripple" @click=${() => this._show_text = false}>SOUND</button>
                                        <button class="btn_sound_off tv bnt_sound_text_width ripple overlay ${classMap({
                                          "learning-on-button": this.buttonBeingLearned === "TV Speaker"
                                        })}"
                                        style="margin-left: calc(var(--remotewidth) / 10);" @click=${() => this._handleAction("TV Speaker")}>TV Speaker</button>
                                        <button class="btn_sound_off tv-opt bnt_sound_text_width ripple overlay ${classMap({
                        "learning-on-button": this.buttonBeingLearned === "TV External Speaker"
                            })}" style="margin-right: calc(var(--remotewidth) / 10);" @click=${() => this._handleAction("TV External Speaker")}>TV + Optic</button>
                                        <button class="btn_sound_off tv-phone bnt_sound_text_width ripple overlay ${classMap({
                        "learning-on-button": this.buttonBeingLearned === "TV Speaker Headphone"
                            })}" style="margin-left: calc(var(--remotewidth) / 10);" @click=${() => this._handleAction("TV Speaker Headphone")}>TV + H-Phone</button>
                                        <button class="btn_sound_off opt bnt_sound_text_width ripple overlay ${classMap({
                        "learning-on-button": this.buttonBeingLearned === "External Optical"
                            })}" style="margin-right: calc(var(--remotewidth) / 10);" @click=${() => this._handleAction("External Optical")}>Optical</button>
                                        <button class="btn_sound_off hdmi bnt_sound_text_width ripple overlay ${classMap({
                        "learning-on-button": this.buttonBeingLearned === "HDMI"
                            })}" style="margin-left: calc(var(--remotewidth) / 10);" @click=${() => this._handleAction("HDMI")}>HDMI</button>
                                        <button class="btn_sound_off line bnt_sound_text_width ripple overlay ${classMap({
                        "learning-on-button": this.buttonBeingLearned === "Lineout"
                            })}" style="margin-right: calc(var(--remotewidth) / 10);" @click=${() => this._handleAction("Lineout")}>Lineout</button>
                                        <button class="btn_sound_off phone bnt_sound_text_width ripple overlay ${classMap({
                        "learning-on-button": this.buttonBeingLearned === "Headphone"
                            })}" style="margin-left: calc(var(--remotewidth) / 10);" @click=${() => this._handleAction("Headphone")}>HeadPhone</button>
                                        <button class="btn_sound_off bluetooth bnt_sound_text_width ripple overlay ${classMap({
                        "learning-on-button": this.buttonBeingLearned === "Bluetooth Soundbar"
                            })}" style="margin-right: calc(var(--remotewidth) / 10);" @click=${() => this._handleAction("Bluetooth Soundbar")}>Bluetooth</button>
                                            ` : html`
                                        <button class="sound_icon_text  ripple" @click=${() => this._show_text = true}><ha-icon style="height: calc(var(--remotewidth) / 6); width: calc(var(--remotewidth) / 6);" icon="mdi:speaker"></button>
                                        <button class="btn_sound_off tv bnt_sound_text_width ripple overlay ${classMap({
                        "learning-on-button": this.buttonBeingLearned === "TV Speaker"
                            })}" style="margin-left: calc(var(--remotewidth) / 10);" @click=${() => this._handleAction("TV Speaker")}}><ha-icon class="icon_source" icon="mdi:television-classic"></button>
                                        <button class="btn_sound_off tv-opt bnt_sound_text_width ripple overlay ${classMap({
                        "learning-on-button": this.buttonBeingLearned === "TV External Speaker"
                            })}" style="margin-right: calc(var(--remotewidth) / 10);" @click=${() => this._handleAction("TV External Speaker")}>${HuiMoreInfoBroadlink.tvoptic}</button>
                                        <button class="btn_sound_off tv-phone bnt_sound_text_width ripple overlay ${classMap({
                        "learning-on-button": this.buttonBeingLearned === "TV Speaker Headphone"
                            })}" style="margin-left: calc(var(--remotewidth) / 10);" @click=${() => this._handleAction("TV Speaker Headphone")}>${HuiMoreInfoBroadlink.tvheadphone}</button>
                                        <button class="btn_sound_off opt bnt_sound_text_width ripple overlay ${classMap({
                        "learning-on-button": this.buttonBeingLearned === "External Optical"
                            })}" style="margin-right: calc(var(--remotewidth) / 10);" @click=${() => this._handleAction("External Optical")}>${HuiMoreInfoBroadlink.optic}</button>
                                        <button class="btn_sound_off hdmi bnt_sound_text_width ripple overlay ${classMap({
                        "learning-on-button": this.buttonBeingLearned === "HDMI"
                            })}" style="margin-left: calc(var(--remotewidth) / 10);" @click=${() => this._handleAction("HDMI")}>${HuiMoreInfoBroadlink.arc}</button>
                                        <button class="btn_sound_off line bnt_sound_text_width ripple overlay ${classMap({
                        "learning-on-button": this.buttonBeingLearned === "Lineout"
                            })}" style="margin-right: calc(var(--remotewidth) / 10);" @click=${() => this._handleAction("Lineout")}>${HuiMoreInfoBroadlink.lineout}</button>
                                        <button class="btn_sound_off phone bnt_sound_text_width ripple overlay ${classMap({
                        "learning-on-button": this.buttonBeingLearned === "Headphone"
                            })}" style="margin-left: calc(var(--remotewidth) / 10);" @click=${() => this._handleAction("Headphone")}><ha-icon class="icon_source" icon="mdi:headphones"></button>
                                        <button class="btn_sound_off bluetooth bnt_sound_text_width ripple overlay ${classMap({
                        "learning-on-button": this.buttonBeingLearned === "Bluetooth Soundbar"
                            })}" style="margin-right: calc(var(--remotewidth) / 10);" @click=${() => this._handleAction("Bluetooth Soundbar")}><ha-icon class="icon_source" icon="mdi:bluetooth"></button>
                                        `}
                                </div>
                            </div>
        <!-- ################################# SOUND END ################################# -->
                            ` : html`

                            <div id="spacer">
                            ${this._show_keypad ? html`
        <!-- ################################ keypad ################################## -->
                                <div class="grid-container-keypad">
                                    <button class="btn-keypad ripple ${classMap({
                        "learning-on-button": this.buttonBeingLearned === "1"
                            })}" @click=${() => this._handleAction("1")}>1</button>
                                    <button class="btn-keypad ripple ${classMap({
                        "learning-on-button": this.buttonBeingLearned === "2"
                            })}" @click=${() => this._handleAction("2")}>2</button>
                                    <button class="btn-keypad ripple ${classMap({
                        "learning-on-button": this.buttonBeingLearned === "3"
                            })}" @click=${() => this._handleAction("3")}>3</button>
                                    <button class="btn-keypad ripple ${classMap({
                        "learning-on-button": this.buttonBeingLearned === "4"
                            })}" @click=${() => this._handleAction("4")}>4</button>
                                    <button class="btn-keypad ripple ${classMap({
                        "learning-on-button": this.buttonBeingLearned === "5"
                            })}" @click=${() => this._handleAction("5")}>5</button>
                                    <button class="btn-keypad ripple ${classMap({
                        "learning-on-button": this.buttonBeingLearned === "6"
                            })}" @click=${() => this._handleAction("6")}>6</button>
                                    <button class="btn-keypad ripple ${classMap({
                        "learning-on-button": this.buttonBeingLearned === "7"
                            })}" @click=${() => this._handleAction("7")}>7</button>
                                    <button class="btn-keypad ripple ${classMap({
                        "learning-on-button": this.buttonBeingLearned === "8"
                            })}" @click=${() => this._handleAction("8")}>8</button>
                                    <button class="btn-keypad ripple ${classMap({
                        "learning-on-button": this.buttonBeingLearned === "9"
                            })}" @click=${() => this._handleAction("9")}>9</button>
                                    <button class="btn-keypad"></button>
                                    <button class="btn-keypad ripple ${classMap({
                        "learning-on-button": this.buttonBeingLearned === "0"
                            })}" @click=${() => this._handleAction("0")}>0</button>
                                    <button class="btn-keypad"></button>
                            </div>
                            <!-- ################################# keypad end ############################## -->
                            ` : html`
                            <!-- ################################# DIRECTION PAD ################################# -->
                            <div class="grid-container-cursor${classMap({
                        "expand-animation": this.show_animation === true
                            })}">
                                <div class="shape">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 79"><path d="m 30 15 a 10 10 0 0 1 20 0 a 15 15 0 0 0 15 15 a 10 10 0 0 1 0 20 a 15 15 0 0 0 -15 15 a 10 10 0 0 1 -20 0 a 15 15 0 0 0 -15 -15 a 10 10 0 0 1 0 -20 a 15 15 0 0 0 15 -15" fill="var(--remote-button-color)" stroke="#000000" stroke-width="0" /></svg>
                            </div>
                            <button class="btn ripple item_sound ${classMap({
                        "learning-on-button": this.buttonBeingLearned === "SoundControl"
                            })}" @click=${() => this._handleAction("SoundControl")}><ha-icon icon="mdi:speaker"/></button>
                            <button class="btn ripple item_up ${classMap({
                        "learning-on-button": this.buttonBeingLearned === "UP"
                            })}" style="background-color: transparent;" @click=${() => this._handleAction("UP")}><ha-icon icon="mdi:chevron-up"/></button>
                            <button class="btn ripple item_input ${classMap({
                        "learning-on-button": this.buttonBeingLearned === "Source"
                            })}" @click=${() => this._handleAction("Source")}><ha-icon icon="mdi:import"/></button>
                            <button class="btn ripple item_2_sx ${classMap({
                        "learning-on-button": this.buttonBeingLearned === "LEFT"
                            })}" style="background-color: transparent;" @click=${() => this._handleAction("LEFT")}><ha-icon icon="mdi:chevron-left"/></button>
                            <button class="btn bnt_ok ripple item_2_c ${classMap({
                        "learning-on-button": this.buttonBeingLearned === "ENTER"
                            })}" style="border: solid 2px ${backgroundColor}"  @click=${() => this._handleAction("ENTER")}>OK</button>
                            <button class="btn ripple item_right ${classMap({
                        "learning-on-button": this.buttonBeingLearned === "RIGHT"
                            })}" style="background-color: transparent;" @click=${() => this._handleAction("RIGHT")}><ha-icon icon="mdi:chevron-right"/></button>
                            <button class="btn ripple item_back ${classMap({
                        "learning-on-button": this.buttonBeingLearned === "BACK"
                            })}" @click=${() => this._handleAction("BACK")}><ha-icon icon="mdi:undo-variant"/></button>
                            <button class="btn ripple item_down ${classMap({
                        "learning-on-button": this.buttonBeingLearned === "DOWN"
                            })}" style="background-color: transparent;" @click=${() => this._handleAction("DOWN")}><ha-icon icon="mdi:chevron-down"/></button>
                            <button class="btn ripple item_exit ${classMap({
                        "learning-on-button": this.buttonBeingLearned === "EXIT"
                            })}" @click=${() => this._handleAction("EXIT")}>EXIT</button>
                        </div>
                        <!-- ################################# DIRECTION PAD END ################################# -->
                        `}
                        </div>

                        `}
        <!-- ################################# SOURCE BUTTONS ################################# -->
                          <div class="grid-container-source">
                              <button class="btn_source ripple ${classMap({
                          "learning-on-button": this.buttonBeingLearned === "Netflix"
                              })}" @click=${() => this._handleAction("Netflix")}><ha-icon style="heigth: 70%; width: 70%;" icon="mdi:netflix"/></button>
                              <button class="btn_source ripple ${classMap({
                          "learning-on-button": this.buttonBeingLearned === "Prime Video"
                              })}" @click=${() => this._handleAction("Prime Video")}>${HuiMoreInfoBroadlink.amazonPrimeIcon}</button>
                              <button class="btn_source ripple ${classMap({
                          "learning-on-button": this.buttonBeingLearned === "Disney+"
                              })}" @click=${() => this._handleAction("Disney+")}>${HuiMoreInfoBroadlink.disneyIcon}</button>
                              <button class="btn_source ripple ${classMap({
                          "learning-on-button": this.buttonBeingLearned === "DAZN"
                              })}" @click=${() => this._handleAction("DAZN")}>${HuiMoreInfoBroadlink.daznIcon}</button>
                          </div>
        <!-- ################################# SOURCE BUTTONS END ################################# -->

        <!-- ################################# COLORED BUTTONS ################################# -->
                        <div class="grid-container-color_btn">
                            <button class="btn-color ripple ${classMap({
                        "learning-on-button": this.buttonBeingLearned === "RED"
                            })}" style="background-color: red; height: calc(var(--remotewidth) / 12);" @click=${() => this._handleAction("RED")}></button>
                            <button class="btn-color ripple ${classMap({
                        "learning-on-button": this.buttonBeingLearned === "GREEN"
                            })}" style="background-color: green; height: calc(var(--remotewidth) / 12);" @click=${() => this._handleAction("GREEN")}></button>
                            <button class="btn-color ripple ${classMap({
                        "learning-on-button": this.buttonBeingLearned === "YELLOW"
                            })}" style="background-color: yellow; height: calc(var(--remotewidth) / 12);" @click=${() => this._handleAction("YELLOW")}></button>
                            <button class="btn-color ripple ${classMap({
                        "learning-on-button": this.buttonBeingLearned === "BLUE"
                            })}" style="background-color: blue; height: calc(var(--remotewidth) / 12);" @click=${() => this._handleAction("BLUE")}></button>
                        </div>
        <!-- ################################# COLORED BUTTONS END ################################# -->

                        <div class="grid-container-volume-channel-control" >
                            <button class="btn ripple ${classMap({
                        "learning-on-button": this.buttonBeingLearned === "volume_up"
                            })}"  style="border-radius: 50% 50% 0px 0px; margin: 0px auto 0px auto; height: 100%;" @click=${() => this._handleAction("volume_up")}><ha-icon icon="mdi:plus"/></button>
                            <button class="btn-flat flat-high ripple ${classMap({
                        "learning-on-button": this.buttonBeingLearned === "HOME"
                            })}" style="margin-top: 0px; height: 50%;" @click=${() => this._handleAction("HOME")}><ha-icon icon="mdi:home"></button>
                            <button class="btn ripple ${classMap({
                        "learning-on-button": this.buttonBeingLearned === "CHANNELUP"
                            })}" style="border-radius: 50% 50% 0px 0px; margin: 0px auto 0px auto; height: 100%;" @click=${() => this._handleAction("CHANNELUP")}><ha-icon icon="mdi:chevron-up"/></button>
                            <button class="btn ${classMap({
                        "learning-on-button": this.buttonBeingLearned === "VOLUMEOFF"
                            })}" style="border-radius: 0px; cursor: default; margin: 0px auto 0px auto; height: 100%;" @click=${() => this._handleAction("VOLUMEOFF")}><ha-icon icon="mdi:volume-off"/></button>
                            <button class="btn ripple ${classMap({
                        "learning-on-button": this.buttonBeingLearned === "MUTE"
                            })}" style="color: ${textColor}; height: 100%;" @click=${() => this._handleAction("MUTE")}><span class=""><ha-icon icon="mdi:volume-mute"></span></button>
                            <button class="btn ${classMap({
                        "learning-on-button": this.buttonBeingLearned === "PARKING"
                            })}" style="border-radius: 0px; cursor: default; margin: 0px auto 0px auto; height: 100%;" @click=${() => this._handleAction("PARKING")}><ha-icon icon="mdi:parking"/></button>
                            <button class="btn ripple ${classMap({
                        "learning-on-button": this.buttonBeingLearned === "volume_down"
                            })}" style="border-radius: 0px 0px 50% 50%;  margin: 0px auto 0px auto; height: 100%;" @click=${() => this._handleAction("volume_down")}><ha-icon icon="mdi:minus"/></button>
                            <button class="btn-flat flat-high ripple ${classMap({
                        "learning-on-button": this.buttonBeingLearned === "INFO"
                            })}" style="margin-bottom: 0px; height: 50%;" @click=${() => this._handleAction("INFO")}><ha-icon icon="mdi:information-variant"/></button>
                            <button class="btn ripple ${classMap({
                        "learning-on-button": this.buttonBeingLearned === "CHANNELDOWN"
                            })}" style="border-radius: 0px 0px 50% 50%;  margin: 0px auto 0px auto; height: 100%;"  @click=${() => this._handleAction("CHANNELDOWN")}><ha-icon icon="mdi:chevron-down"/></button>
                        </div>

        <!-- ################################# MEDIA CONTROL ################################# -->
                          <div class="grid-container-media-control" >
                              <button class="btn-flat flat-low ripple ${classMap({
                          "learning-on-button": this.buttonBeingLearned === "play"
                              })}"  @click=${() => this._handleAction("play")}><ha-icon icon="mdi:play"/></button>
                              <button class="btn-flat flat-low ripple ${classMap({
                          "learning-on-button": this.buttonBeingLearned === "pause"
                              })}"  @click=${() => this._handleAction("pause")}><ha-icon icon="mdi:pause"/></button>
                              <button class="btn-flat flat-low ripple ${classMap({
                          "learning-on-button": this.buttonBeingLearned === "stop"
                              })}"  @click=${() => this._handleAction("stop")}><ha-icon icon="mdi:stop"/></button>
                              <button class="btn-flat flat-low ripple ${classMap({
                          "learning-on-button": this.buttonBeingLearned === "rewind"
                              })}"  @click=${() => this._handleAction("rewind")}><ha-icon icon="mdi:skip-backward"/></button>
                              <button class="btn-flat flat-low ripple ${classMap({
                          "learning-on-button": this.buttonBeingLearned === "Record"
                              })}" style="color: red;" @click=${() => this._handleAction("Record")}><ha-icon icon="mdi:record"/></button>
                              <button class="btn-flat flat-low ripple ${classMap({
                          "learning-on-button": this.buttonBeingLearned === "fastForward"
                              })}"  @click=${() => this._handleAction("fastForward")}><ha-icon icon="mdi:skip-forward"/></button>
                          </div>
        <!-- ################################# MEDIA CONTROL END ################################# -->
                          </div>
                        </div>
                    </div>
                    </div>
                    </div>
                </div>
                </div>
                </div>
            </div>
          </ha-dialog>
    `;
  }

  private _handleAction(command: string): void {
    let index = 0;
    if (this.config?.all_devices) {
      for (let i = 0; i < this.config?.all_devices?.length; i++) {
        if (this.config?.all_devices[i].mac === this.config?.entity) {
          index = i
        }
      }
    }
    if (this.config.preset) this.remoteType = this.config.all_devices[index].presets[this.config.preset].type

    if (this.hass && this.config) {

      if (command === 'LearningMode') {
        this.quickLearning = true;
        this.learningOn = !(this.learningOn);
        return;
      }

      if (this.learningOn === true) {
        this.buttonBeingLearned = command;
      }
      if (this.learningOn === true && this.config.preset) {
        this.learningLock = true;
        const mac  = this.config.entity
        const response = learningMode(this.hass, mac, this.config.preset, this.config.entity_id, command);
        response.then((resp) => {
          if (resp.sucess){
            this.learningLock = false;
            this.buttonBeingLearned = "none";
            if (this.quickLearning) {
              this.quickLearning = false;
              this.learningOn = false;
            }
          }
        })

      } else if (this.learningOn === false && command !== 'LearningMode') {
        this.hass.callService("broadlink_custom_card", "send_command", {button_name: command, entity_id: this.config.entity_id})
      }
    }
  }

  private _showWarning(error_message:string): TemplateResult {
    return html`
      <hui-warning>${error_message}</hui-warning>
    `;
  }

    private _showAnimation() {
        this._show_keypad = !this._show_keypad;
        this.show_animation = true;
    }

    getCardSize() {
        return 15;
    }

    public static getIcon(iconName) {
        return Object.keys(this.iconMapping).includes(iconName)
            ? this.iconMapping[iconName]
            : html`<ha-icon style="height: 70%; width: 70%;" icon="${iconName}"/>`;
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
    return [
      haStyleDialog,
      css`
        ha-header-bar {
            --mdc-theme-on-primary: var(--primary-text-color);
            --mdc-theme-primary: var(--mdc-theme-surface);
            flex-shrink: 0;
        }
        .learning-on {
          box-shadow: -1px -1px 5px #FFA500 , 1px 1px 5px #FFA500;
          border-radius: 30px;
        }
        .learning-on-button {
          box-shadow: -1px -1px 5px #ffa500, 1px 1px 5px #ffa500;
        }
        .learning-button {
          height: 30px;
          border-radius: 10px;
          border-width: 0px;
        }
        .content {
          height: 630px;
        }
        .contentFather {
          max-height: 500px;
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          align-items: center;
        }
        .content-history-log {
            padding: 20px 24px 20px 24px;
        }
        state-badge {
            margin-right: 5%;
        }
        .prime {
            margin-left: 3px;
        }
        ha-card {
            border-radius: 2.8rem;
            width: 60%;
            height: 60%;
            cursor: pointer;
            display: flex;
            justify-content: center;
        }

        button:focus {
          outline:0;
        }
        /*Create ripple effec*/
        .ripple {
            position: relative;
            overflow: hidden;
            transform: translate3d(0, 0, 0);
        }
        .ripple:after {
            content: "";
            display: block;
            position: absolute;
            border-radius: 50%;
            width: 100%;
            height: 100%;
            top: 0;
            left: 0;
            pointer-events: none;
            background-image: radial-gradient(circle, #7a7f87 2%, transparent 10.01%);
            background-repeat: no-repeat;
            background-position: 50%;
            transform: scale(10, 10);
            opacity: 0;
            transition: transform .5s, opacity 1s;
        }
        .ripple:active:after {
            transform: scale(0, 0);
            opacity: .3;
            transition: 0s;
        }
        .blink {
            animation: blinker 1.5s linear infinite;
            color: red;
        }
        @keyframes blinker {
            50% {
                opacity: 0;
            }
        }
        .card {
            display: flex;
            justify-content: center;
            width: 100%;
            height: 100%;
            scale: 0.7;
            margin-top: -90px;
        }
        .horizontal-justified-layout {
          display: flex;
          align-items: stretch;
          justify-content: flex-start;
        }
        .page {
            background-color: var(--remote-color);
            height: 100%;
            display: inline-block;
            flex-direction: row;
            border: var(--main-border-width) solid var(--main-border-color);
            border-radius: calc(var(--remotewidth) / 7.5);
            padding: calc(var(--remotewidth) / 37.5) calc(var(--remotewidth) / 15.2) calc(var(--remotewidth) / 11) calc(var(--remotewidth) / 15.2);
        }
        .grid-container-power {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            grid-template-rows: 1fr;
            background-color: transparent;
            overflow: hidden;
            width: var(--remotewidth);
            height: calc(var(--remotewidth) / 3);
        }
        .grid-container-cursor {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            grid-template-rows: 1fr 1fr 1fr;
            overflow: hidden;
            height: var(--remotewidth);
            width: var(--remotewidth);
            grid-template-areas: "sound up input" "left ok right" "back down exit";
        }
        .expand-animation {
          animation: show 0.5s ease-out;
        }
        @keyframes show {
              0%{
                  transform: scale(0);
              }
              100%{
                  transform: scale(1);
              }

          }
        .grid-container-keypad {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            grid-template-rows: 1fr 1fr 1fr 1fr;
            background-color: transparent;
            overflow: hidden;
            background-color: var(--remote-button-color);
            border-radius: 35px;
            height: var(--remotewidth);
            /* width: calc(var(--remotewidth) - 10%); */
            margin: auto;
            animation: expand 500ms ease-out;
        }
        .grid-container-input {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            grid-template-rows: calc(var(--remotewidth) / 2) calc(var(--remotewidth) / 0.5115);
            background-color: transparent;
            overflow: hidden;
            width: var(--remotewidth);
            animation: expand-source 400ms ease-out;
        }
        #spacer-source {
          height: 639px;
          width: 260px;
        }
        @keyframes expand-source {
              0%{
                  height: 0px;
              }
              50%{
                  height: 350px;
              }
              100%{
                  height: 574px;
              }

          }
        #spacer {
          height: 260px;
          width: 260px;
        }
        @keyframes expand {
              0%{
                  height: 0px;
              }
              50%{
                  height: 210px;
              }
              100%{
                  height: var(--remotewidth);
              }

          }
          .buttons {
              height: var(--remoteheight);
              width: var(--remotewidth);
              animation: show 0.5s ease-out;
          }
        .grid-container-sound {
            display: grid;
            grid-template-columns: 1fr 1fr;
            grid-template-rows: 28% 6% 16% 16% 16% 16% 6%;
            background-color: transparent;
            overflow: hidden;
            height: var(--remotewidth);
            width: var(--remotewidth);
            grid-template-areas: "bnt title" ". ." "tv tv-opt" "tv-phone opt" "hdmi line" "phone bluetooth";
            animation: expand-corner 400ms ease-out;
        }
        @keyframes expand-corner {
              0%{
                  height: 0px;
                  width: 0px;
              }
              100%{
                  width: var(--remotewidth);
                  height: var(--remotewidth);
              }

          }
        .grid-container-source {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr 1fr;
            grid-template-rows: auto;
            background-color: transparent;
            width: calc(var(--remotewidth) / 1.03);
            overflow: hidden;
            margin: auto;
        }

          .grid-container-color_btn{
              display: grid;
              grid-template-columns: 1fr 1fr 1fr 1fr;
              grid-template-rows: auto;
              background-color: transparent;
              width: calc(var(--remotewidth) / 1.03);
              height: calc(var(--remotewidth) / 10);
              overflow: hidden;
              margin: auto;
          }

          .grid-container-volume-channel-control {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            grid-template-rows: 1fr 1fr 1fr;
            background-color: transparent;
            width: var(--remotewidth);
            height: calc(var(--remotewidth) / 1.4);
            overflow: hidden;
            margin-top: calc(var(--remotewidth) / 12);
            ;
        }
        .grid-container-media-control {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            grid-template-rows: 1fr 1fr;
            background-color: transparent;
            width: var(--remotewidth);
            height: calc(var(--remotewidth) / 2.85);
            overflow: hidden;
            margin-top: calc(var(--remotewidth) / 12);
            ;
        }
        @media all and (max-width: 600px) {
              .card{
                  scale: 0.8;
                  margin-top: -50px;
              }
              .mdc-dialog .mdc-dialog__content {
                  padding: 0px;
              }
          }
        .grid-item-input{
            grid-column-start: 1;
            grid-column-end: 4;
            grid-row-start: 1;
            grid-row-end: 3;
            display: grid;
            grid-template-columns: auto;
            background-color: var(--remote-button-color);
            margin:auto;
            margin-top: calc(var(--remotewidth) / 2.6);
            overflow: scroll;
            height: calc(var(--remotewidth) * 2.01);
            width: calc(var(--remotewidth) - 9%);
            border-radius: calc(var(--remotewidth) / 12);
            justify-items: center;
        }
        .grid-item-input::-webkit-scrollbar {
            display: none;
        }
        .grid-item-input::-webkit-scrollbar {
            -ms-overflow-style: none;
        }
        .shape {
            grid-column-start: 1;
            grid-column-end: 4;
            grid-row-start: 1;
            grid-row-end: 4;
            padding: 5px;
        }
        .shape-input {
            grid-column-start: 1;
            grid-column-end: 4;
            grid-row-start: 1;
            grid-row-end: 3;
        }
        .shape-sound {
            grid-column-start: 1;
            grid-column-end: 5;
            grid-row-start: 1;
            grid-row-end: 6;
        }
        .source_text {
            grid-column-start: 1;
            grid-column-end: 3;
            grid-row-start: 1;
            grid-row-end: 2;
            text-align: center;
            margin-top: calc(var(--remotewidth) / 6);
            font-size: calc(var(--remotewidth) / 10);
            opacity: 0.3;
        }
        .icon_source {
            height: 65%;
            width: 65%;
        }
        .sound_icon_text {
            background-color: transparent;
            color: var(--remote-text-color);
            font-size: calc(var(--remotewidth) / 18.75);
            width: 70%;
            height: 70%;
            border-width: 0px;
            margin:auto auto 0px 0px;
            overflow: hidden;
            grid-area: title;
            cursor: pointer;
        }
        .btn_soundoutput {
            font-size: calc(var(--remotewidth) / 12.5);
            width: 70%;
            height: 70%;
            border-width: 0px;
            margin:auto auto 0px 0px;
            display: block;
            cursor: pointer;
            background-color: transparent;
            opacity: 0.4;
            color: var(--remote-text-color);
            font-weight: bold;
            grid-area: title;
        }
        .tv {
            grid-area: tv;
        }
        .tv-opt {
            grid-area: tv-opt;
        }
        .tv-phone {
            grid-area: tv-phone;
        }
        .opt {
            grid-area: opt;
        }
        .hdmi {
            grid-area: hdmi;
        }
        .phone {
            grid-area: phone;
        }
        .line {
            grid-area: line;
        }
        .bluetooth {
            grid-area: bluetooth;
        }
        .item_sound {
            grid-area: sound;
        }
        .item_up {
            grid-area: up;
        }
        .item_input {
            grid-area: input;
        }
        .item_2_sx{
            grid-area: left;
        }
        .item_2_c {
            grid-area: ok;
        }
        .item_right {
            grid-area: right;
        }
        .item_back {
            grid-area: back;
        }
        .item_down {
            grid-area: down;
        }
        .item_exit {
            grid-area: exit;
        }
        ha-icon {
            width: calc(var(--remotewidth) / 10.8);
            height: calc(var(--remotewidth) / 10.8);
        }
        .btn {
            background-color: var(--remote-button-color);
            color: var(--remote-text-color);
            font-size: calc(var(--remotewidth) / 18.75);
            width: 70%;
            height: 70%;
            border-width: 0px;
            border-radius: 50%;
            margin: auto;
            place-items: center;
            display: inline-block;
            cursor: pointer;
        }
        .bnt-input-back {
            grid-column-start: 3;
            grid-column-end: 4;
            grid-row-start: 1;
            grid-row-end: 2;
            background-color: transparent;
            color: var(--remote-text-color);
            font-size: calc(var(--remotewidth) / 18.75);
            width: 70%;
            height: 50%;
            border-width: 0px;
            border-radius: 50%;
            margin-top: calc(var(--remotewidth) / 21);
            margin-left: calc(var(--remotewidth) / 21);
            place-items: center;
            display: inline-block;
            cursor: pointer;
        }
        .bnt-sound-back {
            margin-left: 0px;
            grid-area: bnt;
            background-color: transparent;
            color: var(--remote-text-color);
            font-size: calc(var(--remotewidth) / 18.75);
            width: 45%;
            height: 83%;
            border-width: 0px;
            border-radius: 50%;
            margin-top: calc(var(--remotewidth) / 21);
            margin-left: calc(var(--remotewidth) / 18);
            place-items: center;
            display: inline-block;
            cursor: pointer;
        }
        .btn-keypad {
            background-color: transparent;
            color: var(--remote-text-color);
            font-size: calc(var(--remotewidth) / 10);
            width: 100%;
            height: 100%;
            border-width: 0px;
        }
        .btn_source {
            background-color: var(--remote-button-color);
            color: var(--remote-text-color);
            width: calc(var(--remotewidth) / 5.9);
            height: calc(var(--remotewidth) / 8.125);
            border-width: 0px;
            border-radius: calc(var(--remotewidth) / 10);
            margin: calc(var(--remotewidth) / 18.57) auto calc(var(--remotewidth) / 20) auto;
            place-items: center;
            cursor: pointer;
        }
          .btn-color {
              background-color: var(--remote-button-color);
              color: var(--remote-text-color);
              width: 70%;
              height: 55%;
              border-width: 0px;
              border-radius: calc(var(--remotewidth) / 10);
              margin: auto;
              place-items: center;
              cursor: pointer;
          }

        .icon_source {
            height: 100%;
            width: 100%;
        }
        .btn-input {
            background-color: var(--remote-button-color);
            color: var(--remote-text-color);
            font-size: calc(var(--remotewidth) / 18.5);
            width: calc(var(--remotewidth) / 1.3);
            height: calc(var(--remotewidth) / 7.2226);
            border-width: 0px;
            border-radius: calc(var(--remotewidth) / 20);
            margin: calc(var(--remotewidth) / 47);
            /* auto; */
            place-items: center;
            display: list-item;
            cursor: pointer;
            border: solid 2px var(--remote-color);
        }
        .btn-input-on {
            background-color: var(--accent-color);
            color: var(--primary-color);
            font-size: calc(var(--remotewidth) / 18.5);
            width: calc(var(--remotewidth) / 1.3);
            height: calc(var(--remotewidth) / 7.2226);
            border-width: 0px;
            border-radius: calc(var(--remotewidth) / 20);
            margin: calc(var(--remotewidth) / 47);
            /* auto; */
            place-items: center;
            display: list-item;
            cursor: pointer;
        }
        .bnt_sound_icon_width {
            width: calc(var(--remotewidth) / 3);
        }
        .bnt_sound_text_width {
            width: calc(var(--remotewidth) / 2.6);
        }
        .btn_sound_on {
            font-size: calc(var(--remotewidth) / 25);
            height: calc(var(--remotewidth) / 9.3);
            border-width: 0px;
            border-radius: calc(var(--remotewidth) / 20);
            margin: auto;
            display: block;
            cursor: pointer;
            background-color: var(--accent-color);
            color: #ffffff;
        }
        .btn_sound_off {
            font-size: calc(var(--remotewidth) / 25);
            height: calc(var(--remotewidth) / 9.3);
            border-width: 0px;
            border-radius: calc(var(--remotewidth) / 20);
            margin: auto;
            display: block;
            cursor: pointer;
            background-color: var(--remote-button-color);
            color: var(--remote-text-color);
            border: solid 2px var(--remote-color);
        }
        .overlay {
            background-color: rgba(0,0,0,0.02)
        }
        .flat-high {
            width: 70%;
            height: 37%;
        }
        .flat-low {
            width: 70%;
            height: 65%;
        }
        .btn-flat {
            background-color: var(--remote-button-color);
            //rgba(255, 0, 0, 1);
            color: var(--remote-text-color);
            font-size: calc(var(--remotewidth) / 18.75);
            border-width: 0px;
            border-radius: calc(var(--remotewidth) / 10);
            margin: auto;
            display :grid;
            place-items: center;
            display: inline-block;
            cursor: pointer;
        }
        .bnt_ok {
            width: 100%;
            height:100%;
            font-size: calc(var(--remotewidth) / 16.6);
            // border: solid 2px var(--backgroundcolor
        }

        .title {
            display: block;
            text-align: center;
            font-weight: bold
        }

        .button-cancel {
          background-color: #a3abae;
          float: left;
          width: 22%;
        }

        #cancel {
          --mdc-icon-size: 24px;
        }
        .remote {
          padding: 38px 71px 38px 71px;
          border-radius: 20px;
        }

        .remoteButtonPower{
          border-radius: 10px;
          background-color: var(--card-background-color);
          color: red;
        }

        @media (max-width: 560px) {
          .contentFather {
            --mdc-dialog-min-width: calc( 87vw - env(safe-area-inset-right) - env(safe-area-inset-left) );
            min-width: var(--mdc-dialog-min-width, 280px);
          }
          ha-dialog {
            --mdc-dialog-min-width: calc( 104vw - env(safe-area-inset-right) - env(safe-area-inset-left) );
            --mdc-dialog-max-width: calc( 100vw - env(safe-area-inset-right) - env(safe-area-inset-left) );
            --mdc-dialog-min-height: 100%;
            --mdc-dialog-max-height: 100%;
            --vertial-align-dialog: flex-end;
            --ha-dialog-border-radius: 0px;
          }
          .mdc-dialog .mdc-dialog__surface {
              min-width: 280px;
              min-width: var(--mdc-dialog-min-width, 280px);
              max-height: var(--mdc-dialog-max-height, calc(100% - 32px));
              min-height: var(--mdc-dialog-min-height);
              border-radius: 0px !important;
          }
        }
    `];
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "remote-card-dialog": HuiMoreInfoBroadlink;
  }
}