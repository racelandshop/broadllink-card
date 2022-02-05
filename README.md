# Broadlink Custom card

Inspirted by [ROKU card](https://github.com/iantrich/roku-card)


A custom broadlink card for homeassitant. Requires the companion [custom_component](https://github.com/racelandshop/broadlink_custom_component) to work

## Setup

1. Download the [custom_component](https://github.com/racelandshop/broadlink_custom_component) and place in the `config/custom_component` folder.
2. - Add this line to the `configuration.yalm` file
```yaml
broadlink_custom_card:
```

3. Download the custom broadlink card from this repository, place it in `config/www` folder
4. Register the broadlink-card:
   4a. Include the card code in your `ui-lovelace-card.yaml`
   ```yaml
   title: Home
   resources:
     - url: /local/broadlink-remote-card.js
       type: module
   ```
   4b Go to Config -> Lovelace -> Resources in your Home Assitant instance. Click Add Resource and ad the url `/local/broadlink-remote-card.js`. Save

5. Restart Home Assistant

In case you have questions regarding the installation post an [Issue](https://github.com/racelandshop/broadllink-card/issues)


## FEATURES




This custom card will discover and control your broadlink universal remotes. Please ensure your devices are correctly connected to your local network by following the steps bellow. If you have already configured the device with the Broadlink app, this step may not be necessary.

### Broadlink Remote setup

Use pip3 to install the latest version of this module.

```
pip3 install broadlink
```

Open Python 3 and import this module.

```
python3
```
```python3
import broadlink
```



1. Put the device into AP Mode.
  - Long press the reset button until the blue LED is blinking quickly.
  - Long press again until blue LED is blinking slowly.
  - Manually connect to the WiFi SSID named BroadlinkProv.
2. Connect the device to your local network with the setup function.
```python3
broadlink.setup('myssid', 'mynetworkpass', 3)
```

Security mode options are (0 = none, 1 = WEP, 2 = WPA1, 3 = WPA2, 4 = WPA1/2)


For more information you can check the amazing [python-broadlink](https://github.com/mjg59/python-broadlink) repostitory.


### Discover Devices

The broadlink devices and discovered when the homeassistant is started and when the user clicks on the "Discover" button in the card editor

### Learning Mode
