import { PlatformConfig, Logger } from 'homebridge';

export class GarageDoorConfig {
  // Configuration properties
  public name: string;
  public id: string;
  public doorOpenedSensorPin: number;
  public doorClosedSensorPin: number;
  public doorSwitchPin: number;
  public doorOpenedInSeconds: number;
  public doorSwitchContactInMilliseconds: number;
  public hideDoorSensors: boolean;
  constructor(config: PlatformConfig, log: Logger) {
    this.name = config['name'] || 'GPIO Garage Door Opener';
    this.id = config['id'] || '5edc5fa5-0d95-442c-9bc7-a9da70bc3827';
    this.doorOpenedSensorPin = + config['doorOpenedSensorPin'] || 17;
    this.doorClosedSensorPin = + config['doorClosedSensorPin'] || 18;
    this.doorSwitchPin = + config['doorSwitchPin'] || 5;
    this.doorOpenedInSeconds = + config['doodoorOpenedInSecondsrClosedSensorPin'] || 5;
    this.doorSwitchContactInMilliseconds = + config['doorSwitchContactInMilliseconds'] || 500;
    this.hideDoorSensors = config['hideDoorSensors'] || false;

    log.debug('===========================Config:', this.name);
    log.debug('                               id:', this.id);
    log.debug('              doorOpenedSensorPin:', this.doorOpenedSensorPin);
    log.debug('              doorClosedSensorPin:', this.doorClosedSensorPin);
    log.debug('                    doorSwitchPin:', this.doorSwitchPin);
    log.debug('              doorOpenedInSeconds:', this.doorOpenedInSeconds);
    log.debug('  doorSwitchContactInMilliseconds:', this.doorSwitchContactInMilliseconds);
    log.debug('                  hideDoorSensors:', this.hideDoorSensors);
  }
}