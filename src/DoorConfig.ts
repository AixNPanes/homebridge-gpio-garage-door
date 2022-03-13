import { GarageConfig } from './GarageConfig';

const defaultOpenedSensorPin = [17];
const defaultClosedSensorPin = [18];
const defaultSwitchPin = [5];
const defaultOpenedInSeconds = [5];
const defaultSwitchContactInMS = [500];

export class DoorConfig {
  public doorOpenedSensorPin: number;
  public doorClosedSensorPin: number;
  public doorSwitchPin: number;
  public doorOpenedInSeconds: number;
  public doorSwitchContactInMS: number;

  constructor(
    public garageConfig: GarageConfig,
    public door: number,
  ) {
    const pos = door - 1;
    this.doorOpenedSensorPin = this.getConfig('OpenedSensorPin', defaultOpenedSensorPin[pos]);
    this.doorClosedSensorPin = this.getConfig('ClosedSensorPin', defaultClosedSensorPin[pos]);
    this.doorSwitchPin = this.getConfig('SwitchPin', defaultSwitchPin[pos]);
    this.doorOpenedInSeconds = this.getConfig('OpenedInSecondsrClosedSensorPin', defaultOpenedInSeconds[pos]);
    this.doorSwitchContactInMS = this.getConfig('SwitchContactInMilliseconds', defaultSwitchContactInMS[pos]);
  }

  public isDefault(): boolean {
    const pos = this.door - 1;
    return this.doorOpenedSensorPin === defaultOpenedSensorPin[pos] &&
      this.doorClosedSensorPin === defaultClosedSensorPin[pos] &&
      this.doorSwitchPin === defaultSwitchPin[pos] &&
      this.doorOpenedInSeconds === defaultOpenedInSeconds[pos] &&
      this.doorSwitchContactInMS === defaultSwitchContactInMS[pos];
  }

  private getConfig(subKey: string, defalt: number): number {
    const config = this.garageConfig.platformConfig;
    return config['door' + this.door + subKey] || defalt;
  }

  public logit() {
    this.garageConfig.log.debug('  -------------Door:', this.door);
    this.garageConfig.log.debug('      OpenedSensorPin:', this.doorOpenedSensorPin);
    this.garageConfig.log.debug('      ClosedSensorPin:', this.doorClosedSensorPin);
    this.garageConfig.log.debug('            SwitchPin:', this.doorSwitchPin);
    this.garageConfig.log.debug('      OpenedInSeconds:', this.doorOpenedInSeconds);
    this.garageConfig.log.debug('    SwitchContactInMS:', this.doorSwitchContactInMS);
  }
}