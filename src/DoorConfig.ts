import { Logger } from 'homebridge';

export class DoorConfig {
  public displayName: string;
  public doorOpenedSensorPin: number;
  public doorClosedSensorPin: number;
  public doorSwitchPin: number;
  public doorOpensInSeconds: number;
  public doorSwitchContactInMS: number;

  /* eslint-disable  @typescript-eslint/no-explicit-any */
  constructor(config: Record<string, any>) {
    this.displayName = config['displayName'];
    this.doorOpenedSensorPin = config['doorOpenedSensorPin'];
    this.doorClosedSensorPin = config['doorClosedSensorPin'];
    this.doorSwitchPin = config['doorSwitchPin'];
    this.doorOpensInSeconds = config['doorOpensInSeconds'];
    this.doorSwitchContactInMS = config['doorSwitchContactInMilliseconds'];
  }

  public logit(log: Logger, door: number) {
    log.debug('   -------door: ', door);
    log.debug('              display name: ', this.displayName);
    log.debug('                  open pin: ', this.doorOpenedSensorPin);
    log.debug('                 close pin: ', this.doorClosedSensorPin);
    log.debug('                switch pin: ', this.doorSwitchPin);
    log.debug('          opens in seconds: ', this.doorOpensInSeconds);
    log.debug('             contact in MS: ', this.doorSwitchContactInMS);
  }
}