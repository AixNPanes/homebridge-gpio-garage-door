import { ContactSensor, ContactSensorState, CurrentDoorState, GarageDoorOpener } from 'hap-nodejs/dist/lib/definitions';
import { Name, TargetDoorState } from 'hap-nodejs/dist/lib/definitions';
import { Service, PlatformAccessory } from 'homebridge';
import { Gpio } from 'onoff';

import { GPIOGarageDoorOpener } from './GPIOGarageDoorOpenere';

/**
 * Platform Accessory
 * An instance of this class is created for each accessory your platform registers
 * Each accessory may expose multiple services of different service types.
 */
export class GPIOGarageDoorAccessory {
  private service: Service;
  private openedContactSensorService: Service;
  private closedContactSensorService: Service;
  private openedGpio: Gpio;
  private closedGpio: Gpio;

  private switchState = {
    On: false,
  };

  private openedSensorState = {
    State: 0,
  };

  private closedSensorState = {
    State: 0,
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

    // const TARGET_OPEN = TargetDoorState.OPEN;
    // const TARGET_CLOSE = TargetDoorState.CLOSED;

    // get the LightBulb service if it exists, otherwise create a new LightBulb service
    // you can create multiple services for each accessory
    this.service = this.accessory.getService(GarageDoorOpener)
      || this.accessory.addService(GarageDoorOpener);

    // set the service name, this is what is displayed as the default name on the Home app
    // in this example we are using the name we stored in the `accessory.context` in the `discoverDevices` method.
    this.service.setCharacteristic(Name, accessory.context.device.displayName);

    // each service must implement at-minimum the "required characteristics" for the given service type
    // see https://developers.homebridge.io/#/service/Lightbulb

    // register handlers for the On/Off Characteristic
    this.service.getCharacteristic(TargetDoorState)
      .onSet((value) => {
        this.switchState.On = value as boolean;
        this.platform.log.debug('Set Switch Characteristic On ->', this.switchState2string(value as number));
      })
      .onGet(() => {
        const isOn = this.switchState.On;
        this.platform.log.debug('Get Switch Characteristic On ->', this.switchState2string(isOn?1:0));

        // if you need to return an error to show the device as "Not Responding" in the Home app:
        // throw new this.platform.api.hap.HapStatusError(this.platform.api.hap.HAPStatus.SERVICE_COMMUNICATION_FAILURE);
        return isOn;
      });

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
    this.openedContactSensorService = this.accessory.getService('Opened Contact Sensor') ||
      this.accessory.addService(ContactSensor, 'Opened Contact Sensor', 'OpenedContactSensor');
    this.openedContactSensorService.getCharacteristic(ContactSensorState)
      .onSet((valueOpened) => {
        this.openedSensorState.State = valueOpened as number;
        this.platform.log.debug('Set Opened Sensor Characteristic On ->', this.contactSensor2string(this.openedSensorState.State));
        this.setSwitchState();
      })
      .onGet(() => {
        const state = this.openedSensorState.State;
        this.platform.log.debug('Get Opened Sensor Characteristic On ->', this.contactSensor2string(state));

        // if you need to return an error to show the device as "Not Responding" in the Home app:
        // throw new this.platform.api.hap.HapStatusError(this.platform.api.hap.HAPStatus.SERVICE_COMMUNICATION_FAILURE);
        return state;
      });
    this.openedGpio = new Gpio(this.platform.Config.doorOpenedSensorPin, 'in', 'both', {});
    this.openedContactSensorService.setCharacteristic(ContactSensorState, this.openedGpio.readSync());
    this.openedGpio.watch((err, valueOpened) => {
      if (err !== null && err !== undefined) {
        throw err;
      }
      this.openedContactSensorService.setCharacteristic(ContactSensorState, valueOpened);

    });

    this.closedContactSensorService = this.accessory.getService('Closed Contact Sensor') ||
      this.accessory.addService(ContactSensor, 'Closed Contact Sensor', 'ClosedContactSensor');
    this.closedContactSensorService.getCharacteristic(ContactSensorState)
      .onSet((valueClosed) => {
        this.closedSensorState.State = valueClosed as number;
        this.platform.log.debug('Set Closed Sensor Characteristic On ->', this.contactSensor2string(this.closedSensorState.State));
        this.setSwitchState();
      })
      .onGet(() => {
        const state = this.closedSensorState.State;
        this.platform.log.debug('Get Closed Sensor Characteristic On ->', this.contactSensor2string(state));

        // if you need to return an error to show the device as "Not Responding" in the Home app:
        // throw new this.platform.api.hap.HapStatusError(this.platform.api.hap.HAPStatus.SERVICE_COMMUNICATION_FAILURE);
        return state;
      });
    this.closedGpio = new Gpio(this.platform.Config.doorClosedSensorPin, 'in', 'both', {});
    this.closedContactSensorService.setCharacteristic(ContactSensorState, this.closedGpio.readSync());
    this.closedGpio.watch((err, valueClosed) => {
      if (err !== null && err !== undefined) {
        throw err;
      }
      this.closedContactSensorService.setCharacteristic(ContactSensorState, valueClosed);
    });

    // this.service.setCharacteristic(CurrentDoorState, currentState);
  }

  contactSensor2string(sensor: number): string {
    if (sensor === ContactSensorState.CONTACT_DETECTED) {
      return 'CONTACT_DETECTED';
    } else {
      return 'CONTACT_NOT_DETECTED';
    }
  }

  switchState2string(currentState:number): string {
    const targetState = this.service.getCharacteristic(TargetDoorState).value as number;
    let current = '';
    let target = '';
    target = (targetState === TargetDoorState.OPEN)? 'Open' :
      (targetState === TargetDoorState.CLOSED)? 'Closed' :
        'Undefined';
    current = (currentState === CurrentDoorState.OPEN) ? 'Open' :
      (currentState === CurrentDoorState.OPENING) ? 'Opening' :
        (currentState === CurrentDoorState.CLOSED) ? 'Closed' :
          (currentState === CurrentDoorState.CLOSING) ? 'Closing' :
            (currentState === CurrentDoorState.STOPPED) ? 'Stopped' :
              'Undefined';
    return current + ', ' + target;
  }

  setSwitchState() {
    const openedState = this.openedSensorState.State;
    const closedState = this.closedSensorState.State;
    let switchState = this.service.getCharacteristic(this.platform.Characteristic.CurrentDoorState).value!;
    if (openedState !== closedState) {
      if (openedState === ContactSensorState.CONTACT_DETECTED) {
        switchState = CurrentDoorState.OPEN;
      } else {
        switchState = CurrentDoorState.CLOSED;
      }
    } else {
      if (openedState === ContactSensorState.CONTACT_DETECTED) {
        switchState = CurrentDoorState.STOPPED;
      } else {
        if (switchState === CurrentDoorState.OPEN || switchState === CurrentDoorState.OPENING) {
          switchState = CurrentDoorState.OPENING;
        } else {
          switchState = CurrentDoorState.CLOSING;
        }
      }
    }
    this.service.setCharacteristic(CurrentDoorState, switchState);
  }

  // /**
  //  * Handle "SET" requests from HomeKit
  //  * These are sent when the user changes the state of an accessory, for example, turning on a Light bulb.
  //  */
  // async setOn(value: CharacteristicValue) {
  //   // implement your own code to turn your device on/off
  //   this.switchState.On = value as boolean;

  //   this.platform.log.debug('Set Characteristic On ->', value);
  // }

  // /**
  //  * Handle the "GET" requests from HomeKit
  //  * These are sent when HomeKit wants to know the current state of the accessory, for example, checking if a Light bulb is on.
  //  *
  //  * GET requests should return as fast as possbile. A long delay here will result in
  //  * HomeKit being unresponsive and a bad user experience in general.
  //  *
  //  * If your device takes time to respond you should update the status of your device
  //  * asynchronously instead using the `updateCharacteristic` method instead.

  //  * @example
  //  * this.service.updateCharacteristic(this.platform.Characteristic.On, true)
  //  */
  // async getOn(): Promise<CharacteristicValue> {
  //   // implement your own code to check if the device is on
  //   const isOn = this.switchState.On;

  //   this.platform.log.debug('Get Characteristic On ->', isOn);

  //   // if you need to return an error to show the device as "Not Responding" in the Home app:
  //   // throw new this.platform.api.hap.HapStatusError(this.platform.api.hap.HAPStatus.SERVICE_COMMUNICATION_FAILURE);

  //   return isOn;
  // }

  // async setSensorOn(value: CharacteristicValue) {
  //   // implement your own code to turn your device on/off
  //   this.switchState.On = value as boolean;

  //   this.platform.log.debug('Set Characteristic Open Sensor ->', value);
  // }

  // async getSensorOn(): Promise<CharacteristicValue> {
  //   // implement your own code to check if the device is on
  //   const isOn = this.switchState.On;

  //   this.platform.log.debug('Get Characteristic Open Sensor ->', isOn);

  //   // if you need to return an error to show the device as "Not Responding" in the Home app:
  //   // throw new this.platform.api.hap.HapStatusError(this.platform.api.hap.HAPStatus.SERVICE_COMMUNICATION_FAILURE);

  //   return isOn;
  // }

}
