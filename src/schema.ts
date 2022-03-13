// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
import { localize } from './localize/localize';
import { formatDeviceDropdownOption } from './helpers'

export const remoteConfigSchema = (editorConfig) => {
  const discovered_devices = editorConfig.all_devices.map((dev) => [dev.mac, formatDeviceDropdownOption(dev)]);
  const remoteTypeConfig = editorConfig.selected_device_mac !== undefined ?
    {
      name: "remote_type",
      label: localize('editor.remoteType'),
      type: "select",
      options: [
        ["tv", localize('editor.tv_remote')],
        ["ac", localize('editor.ac_remote')]
      ],
    } :
    {};

  return [
    {
      name: "selected_device_mac",
      label: localize('editor.remote'),
      type: "select",
      options: [
        ...discovered_devices
      ],
    },
    remoteTypeConfig
  ];
}