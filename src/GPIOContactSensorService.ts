import { ContactSensor, ContactSensorState } from 'hap-nodejs/dist/lib/definitions';
import { Service, CharacteristicValue } from 'homebridge';
import { Gpio } from 'onoff';
import { DoorConfig } from './DoorConfig';
import { GPIOGarageDoorAccessory } from './GPIOGarageDoorAccessory';

export interface PinStateListener {
  (accessory: GPIOGarageDoorAccessory): void;
}

export enum OPEN_CLOSE {
  OPENED,
  CLOSED
}

export class GPIOContactSensorService {
  public service: Service;
  private pin: number;
  private activeHigh: boolean;
  private listeners: PinStateListener[] = [];
  public setCharacteristic: string;
  public watchCharacteristic: string;

  public sensorState = {
    State: 0,
  };

  constructor(
    private gpioGarageDoorAccessory: GPIOGarageDoorAccessory,
    private doorConfig: DoorConfig,
    private opened: OPEN_CLOSE,
    private door: number,
  ) {
    const accessory = gpioGarageDoorAccessory.accessory;
    const typeType = opened === OPEN_CLOSE.OPENED ? 'OpenedContactSensor' : 'ClosedContactSensor';
    const typeName = opened === OPEN_CLOSE.OPENED ? 'Opened Contact Sensor' : 'Closed Contact Sensor';
    const characteristicName = opened === OPEN_CLOSE.OPENED ? 'Opened Sensor Characteristic' : 'Closed Sensor Characteristic';
    this.setCharacteristic = 'Set ' + characteristicName;
    this.watchCharacteristic = 'Watch ' + characteristicName;
    this.pin = opened === OPEN_CLOSE.OPENED ? doorConfig.doorOpenedSensorPin : doorConfig.doorClosedSensorPin;
    this.activeHigh = this.pin < 9;
    this.service = accessory.getService(typeName) ||
      accessory.addService(ContactSensor, typeName, typeType);
    this.service.getCharacteristic(ContactSensorState)
      .onSet((value) => {
        this.sensorState.State =value as number;
        gpioGarageDoorAccessory.platform.log.debug(
          'Set ' + characteristicName + ' On ->',
          this.contactSensor2string(this.sensorState.State));
        this.invokeListners();
      })
      .onGet(() => {
        this.gpioGarageDoorAccessory.platform.log.debug(
          this.setCharacteristic + ' ->',
          this.contactSensor2string(this.sensorState.State));

        // if you need to return an error to show the device as "Not Responding" in the Home app:
        // throw new this.platform.api.hap.HapStatusError(this.platform.api.hap.HAPStatus.SERVICE_COMMUNICATION_FAILURE);
        return this.sensorState.State;
      });
    this.gpioGarageDoorAccessory.platform.log.debug('coorOpenedSensorPin: ' + this.pin);
    const gpio = new Gpio(this.pin, 'in', 'both', {});
    this.service.setCharacteristic(ContactSensorState, this.contactSensorState(gpio.readSync()));
    gpio.watch((err, value) => {
      if (err !== null && err !== undefined) {
        throw err;
      }
      this.sensorState.State = this.contactSensorState(value);
      this.gpioGarageDoorAccessory.platform.log.debug(
        this.watchCharacteristic + ' ->',
        this.sensorState.State);
      this.service.setCharacteristic(ContactSensorState, this.sensorState.State);
    });
  }

  private invokeListners() {
    this.listeners.forEach(l => l(this.gpioGarageDoorAccessory));
  }

  public addListener(listener: PinStateListener) {
    this.listeners.push(listener);
  }

  private contactSensorState(value: CharacteristicValue): number {
    return this.activeHigh ? value as number : (1 - (value as number));
  }

  private contactSensor2string(sensor: number): string {
    if (sensor === ContactSensorState.CONTACT_DETECTED) {
      return 'CONTACT_DETECTED';
    } else {
      return 'CONTACT_NOT_DETECTED';
    }
  }
}