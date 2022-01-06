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
  handleAction,
  LovelaceCardEditor,
  getLovelace,
} from 'custom-card-helpers'; // https://github.com/custom-cards/custom-card-helpers


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

// This puts your card into the UI card picker dialog
(window as any).customCards = (window as any).customCards || [];
(window as any).customCards.push({
  type: 'remote-card',
  name: 'Broadlink Remote Card',
  description: 'A remote card for broadlink devices',
});


@customElement('remote-card')
export class RemoteCard extends LitElement {
  public static async getConfigElement(): Promise<LovelaceCardEditor> {
    return document.createElement('remote-card-editor');
  }

  public static getStubConfig(): Record<string, unknown> {
    return {};
  }

  // TODO Add any properities that should cause your element to re-render here
  @property({ attribute: false }) public hass!: HomeAssistant;

  @state() private config!: RemoteCardConfig;

  public setConfig(config: RemoteCardConfig): void {
    // TODO Check for required fields and that they are of the proper format
    if (!config) {
      throw new Error(localize('common.invalid_configuration'));
    }

    if (config.test_gui) {
      getLovelace().setEditMode(true);
    }

    this.config = {
      name: 'Broadlink Remote',
      learning_mode: true,
      ...config,
    };
  }

  // https://lit.dev/docs/components/lifecycle/#reactive-update-cycle-performing
  protected shouldUpdate(changedProps: PropertyValues): boolean {
    if (!this.config) {
      return false;
    }

    return hasConfigOrEntityChanged(this, changedProps, false);
  }

  // https://lit.dev/docs/components/rendering/
  protected render(): TemplateResult | void {
    // TODO Check for stateObj or other necessary things and render a warning if missing
    if (this.config.show_warning) {
      return this._showWarning(localize('common.show_warning'));
    }

    if (this.config.show_error) {
      return this._showError(localize('common.show_error'));
    }

    return html`
      <ha-card>
        <div class="remote">
          <div class="row">
           ${this._renderButton('power', 'mdi:broadcast', 'LearningMode')}
           ${this._renderButton('power', 'mdi:power-off', 'PowerOff')}
           ${this._renderButton('power', 'mdi:power', 'Power')}
          </div>
          <div class="sep"></div>
          <div class="row">
            ${this._renderButton('back', 'mdi:arrow-left', 'Back')}
            ${this._renderButton('info', 'mdi:asterisk', 'Info')} ${this._renderButton('home', 'mdi:home', 'Home')}
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
        </div>
      </ha-card>
    `;
  }

  private _renderButton(button: string, icon: string, title: string): TemplateResult {
      return html`
          <ha-icon-button
          class="remoteButton ${classMap({
            "learning-on-changeMode": this.config.learning_mode === true || button == "LearningMode",
            "learning-on-button": this.config.learning_mode === true || button == "LearningMode",
            "learning-off": this.config.learning_mode === "off"})}"
            .button=${button}
            title=${title}
            @action=${this._handleAction}
            .actionHandler=${actionHandler({
              hasHold: this.config && hasAction(this.config.hold_action), //Action Handler. TODO: Might be worthwhile to implement longpress and double click here
            })}
          >
            <ha-icon .icon=${icon}></ha-icon>
          </ha-icon-button>
        `;
  }

  private _handleAction(ev: ActionHandlerEvent): void {
    if (this.hass && this.config && ev.detail.action) {
      handleAction(this, this.hass, this.config, ev.detail.action);
    }
  }

  private _showWarning(warning: string): TemplateResult {
    return html`
      <hui-warning>${warning}</hui-warning>
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

  // box-shadow:
  // {% if is_state('input_boolean.learning_mode_remote_number', 'on') %}
  //   -1px -1px 5px #FFA500 , 1px 1px 5px #FFA500;
  // {% elif is_state('input_boolean.learning_mode_remote_number', 'off') %}
  //   -2px -2px 5px #2c2c2c , 2px 2px 5px #191919;
  // {% endif %}

  static get styles(): CSSResultGroup {
    return css`
      ha-card {
        background-color: var(--primary-background-color);
        border-radius: 20px;
        margin: 10px auto;
      }

      .remote {
        padding: 15px 0px 15px 0px;
      }
      ha-icon {
        cursor: pointer;
      }
      ha-icon-button {
        --mdc-icon-size: 48px;
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

      ha-icon-button ha-icon {
        display: flex;
      }

      .sep{
        padding: 25px 36px 8px 25px;
      }

      .row {
        display: flex;
        padding: 8px 36px 8px 36px;
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
