
import { fetchBroadlinkRemoteDevices, discoverBroadlinks} from "./webhook"
import { HomeAssistant } from "custom-card-helpers";

export interface DeviceConfig {
  mac: string,
  device_type: string,
  is_locked: boolean,
  presets
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const defineDefault = (myVar: undefined | any): string => {
  if (myVar === undefined) {
    return '';
  } else {
    return myVar;
  }
}

export const formatDeviceDropdownOption = (device:DeviceConfig):string => {
  return device.device_type + " ("  + device.mac + ")"
}


export const fetchDevicesMac = async (hass: HomeAssistant | undefined): Promise<DeviceConfig[]> => {
  return await fetchBroadlinkRemoteDevices(hass).then(
    resp => {
      return resp.devices;
    }
  );
}

export const discoverDevices = async (hass: HomeAssistant | undefined): Promise<DeviceConfig[]> => {
  return await discoverBroadlinks(hass).then(
    resp => {
      return resp.devices;
    }
  );
}

// export const fetchRemote = async (hass: HomeAssistant | undefined, config: RemoteCardConfig): Promise<DeviceConfig[]> => {
//   return await fetch_remote_broadlink(hass, config).then(
//     resp => {
//       return resp.preset_list;
//     }
//   );
// }
