import { Service, PlatformAccessory, CharacteristicValue } from 'homebridge';

import { GPIOGarageDoorOpener } from './GPIOGarageDoorOpenere';

/**
 * Platform Accessory
 * An instance of this class is created for each accessory your platform registers
 * Each accessory may expose multiple services of different service types.
 */
export class GPIOGarageDoorAccessory {
  private service: Service;

  /**
   * These are just used to create a working example
   * You should implement your own code to track the state of your accessory
   */
  private exampleStates = {
    On: false,
    Brightness: 100,
  };

  constructor(
    private readonly platform: GPIOGarageDoorOpener,
    private readonly accessory: PlatformAccessory,
  ) {

    // set accessory information
    this.accessory.getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.Manufacturer, 'Default-Manufacturer')
      .setCharacteristic(this.platform.Characteristic.Model, 'Default-Model')
      .setCharacteristic(this.platform.Characteristic.SerialNumber, 'Default-Serial');

    // get the LightBulb service if it exists, otherwise create a new LightBulb service
    // you can create multiple services for each accessory
    this.service = this.accessory.getService(this.platform.Service.GarageDoorOpener)
      || this.accessory.addService(this.platform.Service.GarageDoorOpener);

    // set the service name, this is what is displayed as the default name on the Home app
    // in this example we are using the name we stored in the `accessory.context` in the `discoverDevices` method.
    this.service.setCharacteristic(this.platform.Characteristic.Name, accessory.context.device.displayName);

    // each service must implement at-minimum the "required characteristics" for the given service type
    // see https://developers.homebridge.io/#/service/Lightbulb

    // register handlers for the On/Off Characteristic
    this.service.getCharacteristic(this.platform.Characteristic.TargetDoorState)
      .onSet(this.setOn.bind(this))                // SET - bind to the `setOn` method below
      .onGet(this.getOn.bind(this));               // GET - bind to the `getOn` method below

    /**
     * Creating multiple services of the same type.
     *
     * To avoid "Cannot add a Service with the same UUID another Service without also defining a unique 'subtype' property." error,
     * when creating multiple services of the same type, you need to use the following syntax to specify a name and subtype id:
     * this.accessory.getService('NAME') || this.accessory.addService(this.platform.Service.Lightbulb, 'NAME', 'USER_DEFINED_SUBTYPE_ID');
     *
     * The USER_DEFINED_SUBTYPE must be unique to the platform accessory (if you platform exposes multiple accessories, each accessory
     * can use the same sub type id.)
     */

    // add two "contsact sensors" services to the accessory
    const openedContactSensorService = this.accessory.getService('Opened Contact Sensor') ||
      this.accessory.addService(this.platform.Service.ContactSensor, 'Opened Contact Sensor', 'OpenedContactSensor');
    this.platform.log.debug('contactSensor: ' + openedContactSensorService.displayName);

    const closedContactSensorService = this.accessory.getService('Closed Contact Sensor') ||
      this.accessory.addService(this.platform.Service.ContactSensor, 'Closed Contact Sensor', 'ClosedContactSensor');
    this.platform.log.debug('contactSensor: ' + closedContactSensorService.displayName);

    setInterval(() => {
      const ContactSensorState = this.platform.Characteristic.ContactSensorState;
      const CONTACT_DETECTED = ContactSensorState.CONTACT_DETECTED;
      const CONTACT_NOT_DETECTED = ContactSensorState.CONTACT_NOT_DETECTED;
      const openedContactState = Math.floor(Math.random() * 2) === 1
        ? CONTACT_DETECTED
        : CONTACT_NOT_DETECTED;
      const closedContactState = Math.floor(Math.random() * 2) === 1
        ? CONTACT_DETECTED
        : CONTACT_NOT_DETECTED;
      const openedState = openedContactState === CONTACT_DETECTED;
      const closedState = closedContactState === CONTACT_DETECTED;
      this.platform.log.debug('state: ', openedContactState, closedContactState, openedState, closedState);

      openedContactSensorService.setCharacteristic(this.platform.Characteristic.ContactSensorState, openedState);
      closedContactSensorService.setCharacteristic(this.platform.Characteristic.ContactSensorState, closedState);

      const CurrentDoorState = this.platform.Characteristic.CurrentDoorState;
      const CURRENT_OPEN = CurrentDoorState.OPEN;
      const CURRENT_OPENING = CurrentDoorState.OPENING;
      const CURRENT_CLOSED = CurrentDoorState.CLOSED;
      const CURRENT_CLOSING = CurrentDoorState.CLOSING;
      const CURRENT_STOPPED = CurrentDoorState.STOPPED;
      let currentState = this.service.getCharacteristic(CurrentDoorState).value;
      if (openedState) {
        if (closedState) {
          switch(currentState) {
            case CURRENT_OPEN:
            case CURRENT_OPENING:
              currentState = CURRENT_OPENING;
              break;
            case CURRENT_CLOSED:
            case CURRENT_CLOSING:
              currentState = CURRENT_CLOSING;
              break;
            default:
              currentState = CURRENT_STOPPED;
          }
        } else {
          currentState = CURRENT_CLOSED;
        }
      } else {
        if (closedState) {
          currentState = CURRENT_OPEN;
        } else {
          currentState = CURRENT_STOPPED;
        }
      }
      this.service.setCharacteristic(CurrentDoorState, currentState);

      // this.platform.log.debug('Triggering motionSensorOneService:', motionDetected);
      // this.platform.log.debug('Triggering motionSensorTwoService:', !motionDetected);
    }, 10000);
  }

  /**
   * Handle "SET" requests from HomeKit
   * These are sent when the user changes the state of an accessory, for example, turning on a Light bulb.
   */
  async setOn(value: CharacteristicValue) {
    // implement your own code to turn your device on/off
    this.exampleStates.On = value as boolean;

    this.platform.log.debug('Set Characteristic On ->', value);
  }

  /**
   * Handle the "GET" requests from HomeKit
   * These are sent when HomeKit wants to know the current state of the accessory, for example, checking if a Light bulb is on.
   *
   * GET requests should return as fast as possbile. A long delay here will result in
   * HomeKit being unresponsive and a bad user experience in general.
   *
   * If your device takes time to respond you should update the status of your device
   * asynchronously instead using the `updateCharacteristic` method instead.

   * @example
   * this.service.updateCharacteristic(this.platform.Characteristic.On, true)
   */
  async getOn(): Promise<CharacteristicValue> {
    // implement your own code to check if the device is on
    const isOn = this.exampleStates.On;

    this.platform.log.debug('Get Characteristic On ->', isOn);

    // if you need to return an error to show the device as "Not Responding" in the Home app:
    // throw new this.platform.api.hap.HapStatusError(this.platform.api.hap.HAPStatus.SERVICE_COMMUNICATION_FAILURE);

    return isOn;
  }
}
