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
  LovelaceCardEditor,
  getLovelace,
} from 'custom-card-helpers';

import { sendCommand, learningMode} from "./webhook"

import { fetchDevicesMac } from "./helpers"

import './editor';

import type { RemoteCardConfig } from './types';
import { actionHandler } from './action-handler-directive';
import { CARD_VERSION } from './const';
import { localize } from './localize/localize';

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

  @state() private config!: RemoteCardConfig;

  public static async getStubConfig(hass: HomeAssistant): Promise<Record<string, unknown>> {
    const Devices = await fetchDevicesMac(hass).then((resp) => { return resp })
    if (Devices.length === 0) {
      return {
        type: "custom:remote-card",
        all_devices: [],
        selected_device_mac: ''};
    }
    return {
      type: "custom:remote-card",
      selected_device_mac: Devices[0].mac,
      all_devices: Devices.map((device) => ({ mac: device.mac, device_type: device.device_type})),
      preset: "1",
      remoteType: "tv", //remote type {tv, ac}
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

    return html`
      <ha-card>
        <div class="remote ${classMap({
          "learning-on": this.learningOn === true,
          "learning-off": this.learningOn === false
        })}">
          ${this.config.remoteType === "tv" ? this._renderTvRemote() : this.config.remoteType === 'ac' ? this._renderAcRemote() : html ``}
        </div>
      </ha-card>
    `;
  }

  private _renderTvRemote(): TemplateResult | void{
    return html`
    <div class="row">
      ${this._renderButton('learningMode', 'mdi:broadcast', 'LearningMode')}
      ${this._renderButton('powerOff', 'mdi:power-off', 'PowerOff')}
      ${this._renderButton('power', 'mdi:power', 'Power')}
    </div>
    <div class="sep"></div>
    <div class="row">
      ${this._renderButton('back', 'mdi:arrow-left', 'Back')}
      ${this._renderButton('info', 'mdi:asterisk', 'Info')}
      ${this._renderButton('home', 'mdi:home', 'Home')}
    </div>
    <div class="sep"></div>
    <div class="row">
      ${this._renderButton('up', 'mdi:chevron-up', 'Up')}
    </div>
    <div class="row">
      ${this._renderButton('left', 'mdi:chevron-left', 'Left')}
      ${this._renderButton('select', 'mdi:checkbox-blank-circle', 'Select')}
      ${this._renderButton('right', 'mdi:chevron-right', 'Right')}
    </div>
    <div class="row">
    ${this._renderButton('down', 'mdi:chevron-down', 'Down')}
    </div>
    <div class="sep"></div>
    <div class="row">
      ${this._renderButton('reverse', 'mdi:rewind', 'Rewind')}
      ${this._renderButton('play', 'mdi:play-pause', 'Play/Pause')}
      ${this._renderButton('forward', 'mdi:fast-forward', 'Fast-Forward')}
    </div>
    <div class="sep"></div>
    <div class="row">
      ${this._renderButton('volume_mute', 'mdi:volume-mute', 'Volume Mute')}
      ${this._renderButton('volume_down', 'mdi:volume-minus', 'Volume Down')}
      ${this._renderButton('volume_up', 'mdi:volume-plus', 'Volume Up')}
    </div>
    `
  }

  private _renderAcRemote(): TemplateResult | void {
    return html`
    <div class="row">
      ${this._renderButton('learningMode', 'mdi:broadcast', 'LearningMode')}
      ${this._renderButton('powerOffAc', 'mdi:power-off', 'PowerOffAc')}
      ${this._renderButton('powerAc', 'mdi:power', 'PowerAc')}
    </div>
    <div class="row">
     ${this._renderButton('thermometer-minus-ac', 'mdi:thermometer-minus', 'thermometer-minus-ac')}
     ${this._renderButton('thermometer-plus-ac', 'mdi:thermometer-plus', 'thermometer-plus-ac')}
     ${this._renderButton('power-sleep-ac', 'mdi:power-sleep', 'power-sleep-ac')}
   </div>
   <div class="row">
     ${this._renderButton('fanAC', 'mdi:fan-speed-1', 'fan-speed-1-AC')}
     ${this._renderButton('fanAC2', 'mdi:fan-speed-2', 'fan-speed-2-AC')}
     ${this._renderButton('fanAC3', 'mdi:fan-speed-3', 'fan-speed-3-AC')}
   </div>
    `
  }

  private _renderButton(button: string, icon: string, title: string): TemplateResult {
      return html`
          <ha-icon-button
          class="remoteButton ${classMap({
            "learning-on-changeMode": this.learningOn === true && button === "learningMode",
            "learning-on-button": this.learningOn === true && button !== "learningMode" && this.buttonBeingLearned !== title,
            "learning-on-button-lock": this.learningOn === true && button !== "learningMode" && this.learningLock === true && this.buttonBeingLearned === title,
            "learning-off": this.learningOn === false})}"
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

      if (this.learningOn === true) {
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
        background-color: var(--primary-background-color);
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
        --mdc-icon-size: 100%px;
      }

      .remoteButton{
        border-radius: 10px;
        background-color: var(--primary-background-color)
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

      ha-icon-button ha-icon {
        display: flex;
      }

      .sep{
        padding: 25px 0px 8px 0px;
      }

      .row {
        display: flex;
        padding: 8px 8px 8px 8px;
        justify-content: space-evenly;
        align-items: center;
      }

      .warning {
        display: block;
        color: black;
        background-color: #fce588;
        padding: 8px;
      }
    `;
  }
}
