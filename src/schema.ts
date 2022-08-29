// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
import { localize } from './localize/localize';
import { formatDeviceDropdownOption } from './helpers'

export const remoteConfigSchema = (editorConfig) => {
  const remoteTypeConfig = editorConfig.selected_device_mac !== undefined ?
    {
      name: "remote_type",
      label: localize('editor.remoteType'),
      selector: {
        select: {
          options: [
            {
              value: "tv",
              label: localize('editor.tv_remote'),
            },
            {
              value: "ac",
              label: localize('editor.ac_remote'),
            },
          ],
        },
      },
    }
    :
    {};

  return [
    {
      name: "name",
      label: localize('editor.name'),
      selector: { text: {} }
    },
    remoteTypeConfig
  ];
}

export const remoteEditorSchema = (editorConfig) => {
  const discovered_devices = editorConfig.all_devices.map((dev) =>
  {
    return { value: dev.mac, label: formatDeviceDropdownOption(dev) }
  }
  );
  return [
    {
      name: "selected_device_mac",
      label: localize('editor.remote'),
      selector: {
        select: {
          options: [
            ...discovered_devices
          ],
        },
      },
    }
  ];
}

