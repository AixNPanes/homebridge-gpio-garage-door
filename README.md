
<p align="center">

<img src="https://github.com/homebridge/branding/raw/master/logos/homebridge-wordmark-logo-vertical.png" width="150">

</p>

This plugin is based on work by KraigM (https://github.com/KraigM) and stevenguh (https://github.com/stevenguh).
I would have used that as a direct base but I had to make many changes just to get it to compile and decided to restart
with the homebridge-plugin-template.

# Homebridge GPIO Garage Door Opeber for Raspberry Pi

This plugin is only in the very initial stages of development. It is unusable in this state.

To use it as a development base:

git clone
cd
npm install # install dependencies into subdirectory node_modules
npm run build # do a fresh compile and build of the source
homebridge -D # test it
sudo npm link # install a link from this directory into the systems node_modules so you can run the plugin

## Pin numbering

Pins are numbered using the Broadcom (BCM) numbering standard. To see the pin mapping used on your Raspberry Pi, install the wiringpi with 'sudo apt install wiringpi' and run the 'gpio readall' command. See https://www.ics.com/blog/gpio-programming-using-sysfs-interface for details.

I used the Zero Relay: 2-Channel 5V Relay Board for Pi Zero from PiHut (SKU: 103395) which comes with the stacking header presoldered. It uses Raspberry Pi pins 15 (BCM 22) and 29 (BCM 22) as switch ports to trigger relays 1 and 2 respectively. Relay 1 is closest to Raspberry Pi board pin 1/2 and Relay 2 is closest to Raspberry Pi board pin 39/40.

Note that the BCM pins 0-6 have pull-up resistors installed, BCM pins 7 & 8 are apparently hardwired as output pins and cannot be used for sensor inputs, BCM pins 9-29 have pull-down resistors installed. It is therefore assumed that sensors attached to BCM pins 0-6 have their opposite terminals attached to 0V (ground) and that sensors attached to BCM pins 9-29 have their opposite terminals attached to 3.3V.