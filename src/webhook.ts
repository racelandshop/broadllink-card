export interface CommandConfig {
    sucess:string
    code: string
  }

export const discoverBroadlinks = (hass) =>
  hass.connection.sendMessagePromise({
    type: 'broadlink/discover'
  })

export const fetchBroadlinkRemoteDevices = (hass) =>
  hass.connection.sendMessagePromise({
    type: 'broadlink/send_devices'
  })

export const sendCommand = (hass, config, command, preset) =>
  hass.connection.sendMessagePromise({
    type: 'broadlink/send_command',
    mac: config.selected_device_mac,
    button_name: command,
    preset: preset
  })

export const learningMode = (hass, config, command, preset): Promise<CommandConfig> =>
  hass.connection.sendMessagePromise({
    type: 'broadlink/enter_learning_mode',
    mac: config.selected_device_mac,
    button_name: command,
    preset: preset
  })

  export const addRemote = (hass, config, preset, remote_type) =>
  hass.connection.sendMessagePromise({
    type: 'broadlink/add_remote',
    mac: config.selected_device_mac,
    preset: preset,
    remote_type: remote_type
  })

  export const removeRemote = (hass, config, preset) =>
  hass.connection.sendMessagePromise({
    type: 'broadlink/remove_remote',
    mac: config.selected_device_mac,
    preset: preset
  })
