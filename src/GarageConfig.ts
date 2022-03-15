import { PlatformConfig, Logger } from 'homebridge';
import { DoorConfig } from './DoorConfig';

export class GarageConfig {
  // Configuration properties
  public name: string;
  public id: string;
  public doorConfig: DoorConfig[] = [];
  public hideDoorSensors: boolean;
  constructor(
    public platformConfig: PlatformConfig,
    public log: Logger,
  ) {
    this.name = platformConfig['name'] || 'GPIO Garage Door Opener';
    this.id = platformConfig['id'] || '5edc5fa5-0d95-442c-9bc7-a9da70bc3827';
    this.hideDoorSensors = platformConfig['hideDoorSensors'] || false;

    log.debug('===========Config:', this.name);
    log.debug('               id:', this.id);
    log.debug('  hideDoorSensors:', this.hideDoorSensors);
    const doors = platformConfig['doors'];
    for(let i = 0; i < Object.keys(doors).length; i++) {
      const door = doors['' + i + ''];
      log.debug('door:', door);
      const doorConfig = new DoorConfig(door, log);
      this.doorConfig.push(doorConfig);
      doorConfig.logit(log, i);
    }
  }
}