import { PlatformConfig, Logger } from 'homebridge';

const defaultOpenedSensorPin = [17];
const defaultClosedSensorPin = [18];
const defaultSwitchPin = [5];
const defaultOpenedInSeconds = [5];
const defaultSwitchContactInMS = [500];

export class GarageDoorConfig {
  public door: 1;
  public log: Logger;
  public doorOpenedSensorPin: number;
  public doorClosedSensorPin: number;
  public doorSwitchPin: number;
  public doorOpenedInSeconds: number;
  public doorSwitchContactInMS: number;

  constructor(config: PlatformConfig, log: Logger, door: 1) {
    this.log = log;
    this.door = door;
    this.doorOpenedSensorPin = + config['door' + door + 'OpenedSensorPin'] || defaultOpenedSensorPin[door - 1];
    this.doorClosedSensorPin = + config['door' + door + 'ClosedSensorPin'] || defaultClosedSensorPin[door - 1];
    this.doorSwitchPin = + config['door' + door + 'SwitchPin1'] || defaultSwitchPin[door - 1];
    this.doorOpenedInSeconds = + config['door' + door + 'OpenedInSecondsrClosedSensorPin1'] || defaultOpenedInSeconds[door - 1];
    this.doorSwitchContactInMS = + config['door' + door + 'SwitchContactInMilliseconds1'] || defaultSwitchContactInMS[door - 1];
  }

  public logit() {
    this.log.debug('               ----------Door:', this.door);
    this.log.debug('                OpenedSensorPin:', this.doorOpenedSensorPin);
    this.log.debug('                ClosedSensorPin:', this.doorClosedSensorPin);
    this.log.debug('                      SwitchPin:', this.doorSwitchPin);
    this.log.debug('                OpenedInSeconds:', this.doorOpenedInSeconds);
    this.log.debug('    SwitchContactInMilliseconds:', this.doorSwitchContactInMS);
  }
}