import { ContactSensorState, CurrentDoorState, GarageDoorOpener } from 'hap-nodejs/dist/lib/definitions';
import { Name, TargetDoorState } from 'hap-nodejs/dist/lib/definitions';
import { Service, PlatformAccessory, CharacteristicValue } from 'homebridge';
import { Gpio } from 'onoff';
import { DoorConfig } from './DoorConfig';
import { GPIOContactSensorService, OPEN_CLOSE } from './GPIOContactSensorService';
import { GPIOGarageDoorOpener } from './GPIOGarageDoorOpener';

/**
 * Platform Accessory
 * An instance of this class is created for each accessory your platform registers
 * Each accessory may expose multiple services of different service types.
 */
export class GPIOGarageDoorAccessory {
  public service: Service;
  public readonly platform: GPIOGarageDoorOpener;
  public openedContactSensorService: GPIOContactSensorService;
  public closedContactSensorService: GPIOContactSensorService;
  private switchGpio: Gpio;
  private timeoutID: NodeJS.Timeout | null = null;

  private switchState = {
    On: false,
  };

  constructor(
    private readonly garageDoorOpener: GPIOGarageDoorOpener,
    public readonly accessory: PlatformAccessory,
    public readonly config: DoorConfig,
  ) {
    this.platform = garageDoorOpener;
    this.platform.log.debug('platform:' + this.platform);
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

    this.platform.log.debug('doorSwitchPin: ' + config.doorSwitchPin);
    this.switchGpio = new Gpio(config.doorSwitchPin, 'high');
    this.switchGpio.writeSync(0);

    // register handlers for the On/Off Characteristic
    this.service.getCharacteristic(TargetDoorState)
      .onSet((value) => {
        this.platform.log.debug('trace:\n' + (new Error()).stack);
        this.switchState.On = value as boolean;
        this.switchGpio.writeSync(1);
        // this.setTargetState();
        this.platform.log.debug('Set Switch Characteristic On ->', this.switchState2string(value as number));
        setTimeout(() => {
          this.switchGpio.writeSync(0);
          this.platform.log.debug('Set Switch Characteristic On ->', this.switchState2string(value as number));
        }, config.doorSwitchContactInMS);
        this.platform.log.debug('Set Switch Characteristic Continuing');
        this.timeoutID = setTimeout(() => {
          this.service.setCharacteristic(CurrentDoorState, CurrentDoorState.STOPPED);
          this.timeoutID = null;
          this.platform.log.debug('Set Switch Characteristic Complete');
        }, 5000);
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
    this.openedContactSensorService = new GPIOContactSensorService(this, config, OPEN_CLOSE.OPENED, 1);
    this.openedContactSensorService.addListener(this.setSwitchState);
    this.closedContactSensorService = new GPIOContactSensorService(this, config, OPEN_CLOSE.CLOSED, 1);
    this.closedContactSensorService.addListener(this.setSwitchState);
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

  setSwitchState(accessory: GPIOGarageDoorAccessory) {
    const openedState = accessory.openedContactSensorService.sensorState.State;
    const closedState = accessory.closedContactSensorService.sensorState.State;
    let switchState = accessory.service.getCharacteristic(accessory.platform.Characteristic.CurrentDoorState).value!;
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
    accessory.service.setCharacteristic(CurrentDoorState, switchState);
  }

  setTargetState() {
    const currentState = this.service.getCharacteristic(CurrentDoorState).value!;
    let targetState: CharacteristicValue | null = null;
    if (currentState === CurrentDoorState.OPEN || currentState === CurrentDoorState.OPENING) {
      targetState = TargetDoorState.CLOSED;
    } else {
      if (currentState === CurrentDoorState.CLOSED || currentState === CurrentDoorState.CLOSING) {
        targetState = TargetDoorState.OPEN;
      }
    }
    if (targetState !== null) {
      this.service.setCharacteristic(TargetDoorState, targetState);
    }
  }
}
