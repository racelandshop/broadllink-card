import { ActionConfig, LovelaceCard, LovelaceCardConfig, LovelaceCardEditor } from 'custom-card-helpers';
import { DeviceConfig } from './helpers'

declare global {
  interface HTMLElementTagNameMap {
    'remote-card-editor': LovelaceCardEditor;
    'hui-error-card': LovelaceCard;
  }
}

export interface RemoteCardConfig extends LovelaceCardConfig {
  type: string;
  show_warning?: boolean;
  show_error?: boolean;
  test_gui?: boolean;
  entity?: string;
  tap_action?: ActionConfig;
  hold_action?: ActionConfig;
  double_tap_action?: ActionConfig;
  remoteType?: string;
  selected_device_mac: string;
  all_devices: DeviceConfig[];
  preset?: string;
}
