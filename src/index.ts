import { API } from 'homebridge';

import { PLATFORM_NAME } from './settings';
import { GPIOGarageDoorOpener } from './GPIOGarageDoorOpenere';

/**
 * This method registers the platform with Homebridge
 */
export = (api: API) => {
  api.registerPlatform(PLATFORM_NAME, GPIOGarageDoorOpener);
};
