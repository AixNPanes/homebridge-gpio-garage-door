import { PlatformConfig, Logger } from 'homebridge';
import { GarageDoorConfig } from './GarageDoorConfig';

export class GarageConfig {
  // Configuration properties
  public name: string;
  public id: string;
  public door1Config: GarageDoorConfig;
  public hideDoorSensors: boolean;
  constructor(config: PlatformConfig, log: Logger) {
    this.name = config['name'] || 'GPIO Garage Door Opener';
    this.id = config['id'] || '5edc5fa5-0d95-442c-9bc7-a9da70bc3827';
    this.door1Config = new GarageDoorConfig(config, log, 1);
    this.hideDoorSensors = config['hideDoorSensors'] || false;

    log.debug('=======================Config:', this.name);
    log.debug('                           id:', this.id);
    log.debug('              hideDoorSensors:', this.hideDoorSensors);
    this.door1Config.logit();
  }
}