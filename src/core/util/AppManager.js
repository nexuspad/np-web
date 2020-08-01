import Fingerprint2 from 'fingerprintjs2';
import RestClient from './RestClient'
import PromiseManager from './PromiseManager';
import TaskMaster from './TaskMaster'
import StorageUtils from './StorageUtils'
import ListServiceFactory from '../service/ListServiceFactory'
import FolderService from '../service/FolderService'
import SharedFolderService from '../service/SharedFolderService'
import AccountService from '../service/AccountService';
import EventManager from './EventManager'
import AppEvent from './AppEvent'

/**
 * Handles the browser data and initial bootstrapping and cleanup.
 */
export default class AppManager {
  static uuid = '';
  static p;

  static serviceEndpoints () {
    // this is in .env file
    return [
      process.env.VUE_APP_API_URL
    ];
  }

  static serviceLocate () {
    let serviceEndpoints = AppManager.serviceEndpoints();
    let promises = [];
    let workingInstances = [];

    // the service locator returns a promise.
    return new Promise((resolve, reject) => {
      // create promises for all the available endpoints
      // use dummy catch so Promise.all does not reject due to partial failure.
      // https://stackoverflow.com/questions/31424561/wait-until-all-es6-promises-complete-even-rejected-promises/36115549#36115549
      serviceEndpoints.forEach(function (url) {
        promises.push(RestClient.get(url + '/health').catch(e => e))
      });

      Promise.all(promises).then(function (results) {
        results.forEach(function (response) {
          if (response.status && response.status === 200) {
            workingInstances.push(serviceEndpoints.indexOf(response.config.url.replace('/health', '')));
          }
        });

        if (workingInstances.length > 0) {
          RestClient.apiUrl = serviceEndpoints[Math.min(...workingInstances)];
          console.log('[RestClient] ', RestClient.apiUrl);
          resolve();
        } else {
          reject(Error('service endpoint not found'));
        }
      });
    });
  }

  static initClient (clientType) {
    let p = PromiseManager.get('INIT_CLIENT');
    if (p) {
      return p;
    }

    p = new Promise((resolve) => {
      let options = {
        excludes: { userAgent: true, language: true, canvas: true, webgl: true,
                    adBlock: true, audio: true, enumerateDevices: true, plugins: true, fonts: true }
      }
      if (window.requestIdleCallback) {
        requestIdleCallback(function () {
          Fingerprint2.get(options, function (components) {
            AppManager.uuid = clientType + '_' + Fingerprint2.x64hash128(components.map((c) => c.value).join(''), 31);
            resolve(AppManager.uuid);
          });
        })
      } else {
        setTimeout(function () {
          Fingerprint2.get(options, function (components) {
            AppManager.uuid = clientType + '_' + Fingerprint2.x64hash128(components.map((c) => c.value).join(''), 31);
            resolve(AppManager.uuid);
          });
        }, 500);
      }
    });

    PromiseManager.set(p, 'INIT_CLIENT');
    return p;
  }

  static cleanup () {
    AccountService.cleanup();
    TaskMaster.clearAll();
    ListServiceFactory.clearAll();
    FolderService.clear();
    SharedFolderService.clear();
    StorageUtils.deleteCookie(StorageUtils.SESSION_COOKIE_NAME);
    RestClient.destroy();
  }

  static kickout() {
    StorageUtils.deleteCookie(StorageUtils.SESSION_COOKIE_NAME);
    EventManager.publish(AppEvent.ACCOUNT_SESSION_INACTIVE);
  }
}
