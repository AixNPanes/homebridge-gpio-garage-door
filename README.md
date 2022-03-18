
<p align="center">

<img src="https://github.com/homebridge/branding/raw/master/logos/homebridge-wordmark-logo-vertical.png" width="150">

</p>

This plugin is based on work by KraigM (https://github.com/KraigM) and stevenguh (https://github.com/stevenguh).
I would have used that as a direct base but I had to make many changes just to get it to compile and decided to restart with the homebridge-plugin-template.

# Homebridge GPIO Garage Multiple Door Opener for Raspberry Pi

This plugin is feature comple. It can be used to control a garage door. In my case, I am controlling an older model Craftsman garage door opener with a RaspberryPi ZeroW. I have soldered wires to the existing door switch and connected them to the normally open (NO) contacts of a relay. The relay I have chosen (see below) plugs directly onto the GPIO pins of a RaspberryPi with a provided extender connector. It uses 2 contact sensor which can be easily attached to the door and track of the garage door. One is attached when the door is open and the other is attached when the door is closed. Wires are run back to the pins that you specify in your configuration. See __Pin numbering__, below, for guidance.

You may configure multiple garage door controls (see __Configuration__ below). The practical limit is probably 6 as there are only 17 GPIO pins available and each door takes 3 pins. 

## Development

To use it as a development base:

git clone
cd
npm install # install dependencies into subdirectory node_modules
npm run build # do a fresh compile and build of the source
homebridge -D # test it
sudo npm link # install a link from this directory into the systems node_modules so you can run the plugin

## Pin numbering

Pins are numbered using the Broadcom (BCM) numbering standard. To see the pin mapping used on your Raspberry Pi, install the wiringpi package with 'sudo apt install wiringpi' and run the 'gpio readall' command. See https://www.ics.com/blog/gpio-programming-using-sysfs-interface for details.

I used the Zero Relay: 2-Channel 5V Relay Board for Pi Zero from PiHut (SKU: 103395) which comes with the stacking header presoldered. It uses Raspberry Pi pins 15 (BCM 22) and 29 (BCM 5) as switch ports to trigger relays 1 and 2 respectively. Relay 1 is closest to Raspberry Pi board pin 1/2 and Relay 2 is closest to Raspberry Pi board pin 39/40.

Note that the BCM pins 0-6 have pull-up resistors installed, BCM pins 7 & 8 are apparently hardwired as output pins and cannot be used for sensor inputs (although __gpio readall__ implies that 7 is an input as well), BCM pins 9-29 have pull-down resistors installed. It is therefore assumed that sensors attached to BCM pins 0-6 have their opposite terminals attached to 0V (ground) and that sensors attached to BCM pins 9-29 have their opposite terminals attached to 3.3V.

## Configuration

##### Name

This is the configuration name for the Accessory. It may be changed as desired. Required.

##### UUID

This UUID is used to identify the Accessory internally. If changed, you should generate a new one with an acceptable generator. It must be unique for the plugin. Required.

##### Doors

Multiple doors may be controlled with the plugin. To add additional doors, click the __ADD TO DOORS__ button at the bottom of the configuration.

###### Door Name

This is the name of the door and will be used on the label of the door switch. This label should be fairly short as it is also used in the name of the associated sensors. It should be unique for visual identification of the controls. Required.

###### Door Opened Sensor Pin (BCM)

This is the Broadcom pin number to which the Opened sensor is connected. The corresponding pin on the Raspberry Pi should be connected to a contact sensor which is closed when the door is open and otherwise is open. Required.

###### Door Closed Sensor Pin (BCM)

This is the Broadcom pin number to which the Closed sensor is connected. The corresponding pin on the Raspberry Pi should be connected to a contact sensor which is closed when the door is closed and is otherwise open. Required.

###### Door Switch Pin (BCM)

This is the Broadcom pin number to which the relay is connected. The normally open (NO) contact of the relay should be attached to the switch contacts of the existing door switch. Required.

###### Door opens in seconds

This is the timeout (in seconds) after which it is assumed that the door did not complete it's traverse. If the door status does not appropriately change before this timeout expires, the status of the door switch button is changed to __Stopped__.

###### Door switch contact in milliseconds

This is the length of time (in milliseconds) that the relay contacts will be closed when this accessorys button is clicked.

## Operation

The accessory consists of 3 controls, the door switch, an opened sensor, and a closed sensor. The two sensors are read-only and reflect the state of the associated contact sensor OPEN or CLOSED. The door switch control may be clicked to simulate the pressing of the manual door control. When clicked, the manual door control will be virtually pressed pressed for __Door switch contact in milliseconds__. The states for the switch are __Open__, __Closed__, __Opening__, __Closed__, and __Stopped__.

### Switch States

##### Open

The Open sensor is __Closed__ and the Closed sensor is __Open__.

##### Closed

The Open senser is __Open__ and the Closed sensor is __Closed__.

##### Opening

Both the Open sensor and the Closed sensor are __Open__ and the previous state was either __Open__ or __Opening__.

##### Closing

Both the Open sensor and the Closed sensor are __Open__ and the previous state was either __Closed__ or __Closing__.

##### Stopped

Either the Open sensor and the Closed sensor are __Closed__ or the previous activation of the button timed out after __Door opens in seconds__.

