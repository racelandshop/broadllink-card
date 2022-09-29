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
  hasAction,
  ActionHandlerEvent,
  getLovelace,
  fireEvent,
} from 'custom-card-helpers';

import { sendCommand, learningMode} from "./webhook"

import './editor';

import type { RemoteCardConfig } from './types';
import { actionHandler } from './action-handler-directive';
import { CARD_VERSION } from './const';
import { localize } from './localize/localize';
import { BroadlinkDialogParams } from './show-more-info-dialog';
// import { HassDialog } from './common/dom/dialogs/make-dialog-manager';

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

@customElement('digits-dialog')
export class HuiMoreInfoBroadlink extends LitElement  {


  @property({ attribute: false }) public hass!: HomeAssistant;

  @property({ attribute: false }) learningOn = false;

  @property({ attribute: false }) quickLearning = false;

  @property({ attribute: false }) learningLock = false;

  @property({ attribute: false }) buttonBeingLearned = "none";

  @state() private config!: RemoteCardConfig;

  @state() private _params?: BroadlinkDialogParams;

  @state() private broadlinkInfo: any;

  @state() private remoteType: any;

  public async showDialog(params: BroadlinkDialogParams): Promise<void> {
    this._params = params;
    this.broadlinkInfo = this._params.broadlinkInfo;
    this.config = this.broadlinkInfo;
  }

  public closeDialog() {
    this._params = undefined;
    fireEvent(this, "dialog-closed", { dialog: this.localName });
  }

  protected async firstUpdated(changedProps) {
    super.firstUpdated(changedProps);
    fireEvent(this, 'config-changed', { config: this.config });
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
      preset: String(config.preset) //Typecast the "1" above. For some reason is being converted into a number for some reason.
    }
  }

  protected shouldUpdate(changedProps: PropertyValues): boolean {
    if (!this.config) {
      return false;
    }
    return hasConfigOrEntityChanged(this, changedProps, true);
  }

  protected render(): TemplateResult | void {
    if (this.config.show_warning || !(this.config.selected_device_mac)) {
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
        if (this.config?.all_devices[i].mac === this.config?.selected_device_mac) {
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
            <div
              slot="title"
              class="main-title"
              .title=${this.hass!.localize("ui.panel.lovelace.menu.zones")}
            >
              ${this.config.preset}
            </div>
            <ha-icon-button
              slot="navigationIcon"
              dialogAction="cancel"
              .label=${this.hass!.localize(
                "ui.dialogs.more_info_control.dismiss"
    )}
              id="cancel"
              .path=${"M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"}
            ></ha-icon-button>
          </ha-header-bar>
        </div>
        <div class="contentFather">
          <div class="content">
          ${this._renderTvRemote()}
          </div>
        </div>
        <div class="options">

        </div>
      </ha-dialog>
    `;
  }

  private _renderTvRemote(): TemplateResult | void{
    return html`
    <div class="row">
      ${this._renderButton('learningMode', 'mdi:broadcast', 'LearningMode')}
      ${this._renderButton('none', 'mdi:chevron-double-down', 'Channel Down')}
      ${this._renderButton('none', 'mdi:chevron-double-down', 'Channel Down')}
    </div>
    <div class="sep"></div>
    <div class="row">
      ${this._renderButton('number1', 'mdi:numeric-1', 'Number 1')}
      ${this._renderButton('number2', 'mdi:numeric-2', 'Number 2')}
      ${this._renderButton('number3', 'mdi:numeric-3', 'Number 3')}
    </div>
    <div class="sep"></div>
    <div class="row">
      ${this._renderButton('number4', 'mdi:numeric-4', 'Number 4')}
      ${this._renderButton('number5', 'mdi:numeric-5', 'Number 5')}
      ${this._renderButton('number6', 'mdi:numeric-6', 'Number 6')}
    </div>
    <div class="sep"></div>
    <div class="row">
      ${this._renderButton('number7', 'mdi:numeric-7', 'Number 7')}
      ${this._renderButton('number8', 'mdi:numeric-8', 'Number 8')}
      ${this._renderButton('number9', 'mdi:numeric-9', 'Number 9')}
    </div>
    <div class="sep"></div>
    <div class="row">
      ${this._renderButton('none', 'mdi:chevron-double-down', 'Channel Down')}
      ${this._renderButton('number0', 'mdi:numeric-0', 'Number 0')}
      ${this._renderButton('none', 'mdi:chevron-double-down', 'Channel Down')}
    </div>
    <div class="sep"></div>
    `
  }

  private _renderButton(button: string, icon: string, title: string): TemplateResult {
    return html`
      <ha-icon-button
        class="remoteButton ${classMap({
          "learning-on-changeMode": this.learningOn === true && button === "learningMode",
          "learning-on-button": this.learningOn === true && button !== "learningMode" && button !== "none",
          "learning-on-button-lock": this.learningOn === true && button !== "learningMode" && this.learningLock === true && this.buttonBeingLearned === title && button !== "none",
          "learning-off": this.learningOn === false && button !== "none",
          "display_none": button === "none"
        })}"
          button=${button}
          title=${title}
          @action=${this._handleAction}
          .actionHandler=${actionHandler({
      hasHold: hasAction(this.config.hold_action),
    })}
        >
        <ha-icon .icon=${icon}></ha-icon>
      </ha-icon-button>
        `;
  }

  private _handleAction(ev: ActionHandlerEvent): void {
    let index = 0;
    if (this.config?.all_devices) {
      for (let i = 0; i < this.config?.all_devices?.length; i++) {
        if (this.config?.all_devices[i].mac === this.config?.selected_device_mac) {
          index = i
        }
      }
    }
    if (this.config.preset) this.remoteType = this.config.all_devices[index].presets[this.config.preset].type

    if (this.hass && this.config && ev.detail.action) {
      const action = ev.detail.action;
      const command = (ev.currentTarget as HTMLButtonElement).title;

      if (command === 'LearningMode') {
        this._handleToggleLearningMode(action);
        return;
      }

      if (this.learningLock === false) {
        this.buttonBeingLearned = command;
      }
      if (this.learningOn === true && this.config.preset) {
        this.learningLock = true;
        const response = learningMode(this.hass, this.config, command, this.config.preset);
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
        sendCommand(this.hass, this.config, command, this.config.preset);
      }
    }
  }

  private _showWarning(error_message:string): TemplateResult {
    return html`
      <hui-warning>${error_message}</hui-warning>
    `;
  }

  private _handleToggleLearningMode(action): void{
      if (this.learningLock === false) {
        this.learningOn = !(this.learningOn);
        if (action === "tap") {
          this.quickLearning = true;
        }
      }
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
      ha-card {
        background-color: var(--card-background-color);
        height: 400px;
        width: 300px;
      }
      ha-header-bar  {
        --mdc-theme-primary: var(--card-background-color);
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

      .remote.learning-on{
        box-shadow: -1px -1px 5px #FFA500 , 1px 1px 5px #FFA500;
      }

      .remote.learning-on{
        box-shadow: -1px -1px 5px #FFA500 , 1px 1px 5px #FFA500;
      }

      .remote.learning-off{
        box-shadow: -2px -2px 5px #2c2c2c , 2px 2px 5px #191919;
      }

      ha-icon {
        cursor: pointer;
      }
      ha-icon-button {
        --mdc-icon-button-size: 50px;
        --mdc-icon-size: 35px;
        margin: 0 18px;
      }

      .remoteButton{
        border-radius: 10px;
        background-color: var(--card-background-color);
        color: var(--primary-text-color);
        --mdc-icon-button-size: 50px;
        --mdc-icon-size: 35px;
      }
      .remoteButton.display_none {
        border-radius: 0;
        background-color: var(--card-background-color);
        color: var(--card-background-color);
      }

      .remoteButton.learning-on-changeMode{
        box-shadow: -1px -1px 5px #0000FF , 1px 1px 0px #0000FF;
      }

      .remoteButton.learning-on-button{
        box-shadow: -1px -1px 5px #FFA500 , 1px 1px 5px #FFA500;
      }

      .remoteButton.learning-off{
        box-shadow: -2px -2px 5px #2c2c2c , 2px 2px 5px #191919;
      }

      .remoteButton.learning-on-button-lock{
        box-shadow: -1px -1px 5px #FFA500 , 1px 1px 5px #FFA500;
        color: rgb(227 145 145)
      }

      .remoteButtonPower{
        border-radius: 10px;
        background-color: var(--card-background-color);
        color: red;
      }
      .buttonRound {
        border-radius: 50%;
        --mdc-icon-button-size: 40px;
        --mdc-icon-size: 30px;
      }

      ha-icon-button ha-icon {
        display: flex;
      }
      ha-icon-button > mwc-icon-button {
        width: 40px;
        height: 40px;
      }
      .sep{
        padding: 3vh 0px 8px 0px;
      }

      .row {
        display: flex;
        padding: 8px 20px 8px 20px;
        justify-content: center;
        align-items: center;
      }

      .contentFather {
          width: 100%;
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
      .warning {
        display: block;
        color: black;
        background-color: #fce588;
        padding: 8px;
      }
      .main-title {
        white-space: nowrap;
        /* display: inline-block; */
        overflow: hidden;
        max-width: 200px;
        text-overflow: ellipsis;
      }
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "digits-dialog": HuiMoreInfoBroadlink;
  }
}