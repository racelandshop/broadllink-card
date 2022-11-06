import { ActionConfig, LovelaceCard, LovelaceCardConfig, LovelaceCardEditor, NumberFormat, TimeFormat } from 'custom-card-helpers';
import { DeviceConfig } from './helpers'

declare global {
  let __DEV__: boolean;
  interface HTMLElementTagNameMap {
    'remote-card-editor': LovelaceCardEditor;
    'hui-error-card': LovelaceCard;
  }
}

export type Constructor<T = any> = new (...args: any[]) => T;

export interface RemoteCardConfig extends LovelaceCardConfig {
  type: string;
  show_warning?: boolean;
  show_error?: boolean;
  test_gui?: boolean;
  entity?: string;
  tap_action?: ActionConfig;
  hold_action?: ActionConfig;
  double_tap_action?: ActionConfig;
  remote_type?: string;
  selected_device_mac?: string;
  all_devices: DeviceConfig[];
  presets?: unknown;
  preset?: string;
  entity_id?: string;
}

export interface Lovelace {
  config: LovelaceConfig;
  // If not set, a strategy was used to generate everything
  rawConfig: LovelaceConfig | undefined;
  editMode: boolean;
  urlPath: string | null;
  mode: "generated" | "yaml" | "storage";
  locale: FrontendLocaleData;
  enableFullEditMode: () => void;
  setEditMode: (editMode: boolean) => void;
  saveConfig: (newConfig: LovelaceConfig) => Promise<void>;
  deleteConfig: () => Promise<void>;
}

export interface LovelaceConfig {
  title?: string;
  strategy?: {
    type: string;
    options?: Record<string, unknown>;
  };
  views: LovelaceViewConfig[];
  background?: string;
}

export interface LovelaceViewConfig {
  index?: number;
  title?: string;
  type?: string;
  strategy?: {
    type: string;
    options?: Record<string, unknown>;
  };
  badges?: Array<string | LovelaceBadgeConfig>;
  cards?: LovelaceCardConfig[];
  path?: string;
  icon?: string;
  theme?: string;
  panel?: boolean;
  background?: string;
  visible?: boolean | ShowViewConfig[];
}

export interface LovelaceBadgeConfig {
  type?: string;
  [key: string]: any;
}

export interface ShowViewConfig {
  user?: string;
}

export interface FrontendLocaleData {
  language: string;
  number_format: NumberFormat;
  time_format: TimeFormat;
  theme: string;
  // theme: {
  //   theme: string;
  //   dark?: boolean;
  //   // primaryColor?: string;
  //   // accentColor?: string;
  // };
}