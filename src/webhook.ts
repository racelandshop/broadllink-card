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

export const learningMode = (hass, mac: string|undefined, preset_name: string, entity_id: string | undefined, button_name: string): Promise<CommandConfig> =>
  hass.connection.sendMessagePromise({
    type: 'broadlink/enter_learning_mode',
    mac: mac,
    preset_name: preset_name,
    entity_id: entity_id,
    button_name: button_name
  })

export const addRemote = (hass, config, preset, remote_type) =>
  hass.connection.sendMessagePromise({
    type: 'broadlink/add_remote',
    mac: config.entity,
    preset: preset,
    remote_type: remote_type
  })

  export const removeRemote = (hass, config, preset) =>
  hass.connection.sendMessagePromise({
    type: 'broadlink/remove_remote',
    mac: config.entity,
    preset: preset
  })
