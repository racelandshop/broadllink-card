
import { fetchBroadlinkRemoteDevices, discoverBroadlinks} from "./webhook"
import { HomeAssistant } from "custom-card-helpers";

export interface DeviceConfig {
  mac: string,
  device_type: string,
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
