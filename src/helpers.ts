
import { fetchBroadlinkRemoteDevices, discoverBroadlinks} from "./webhook"
import { HomeAssistant } from "custom-card-helpers";

export interface DeviceConfig {
  mac: string,
  device_type: string,
  //presets: string,
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
