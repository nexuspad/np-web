import ServiceHelper from './ServiceHelper'
import PromiseManager from '../util/PromiseManager'
import RestClient from '../util/RestClient'
import ErrorHandler from '../util/ErrorHandler'
import ContentHelper from './ContentHelper';
import axios from 'axios';

export default class CmsService {
  static _timezoneHelperData;

  static getTimezoneHelperData () {
    if (CmsService._timezoneHelperData) {
      let p = new Promise((resolve) => {
        resolve(CmsService._timezoneHelperData);
      });
      return p;
    }

    let uri = ServiceHelper.cms + '/timezonenames';
    let p = PromiseManager.get(uri);

    if (p) {
      return p;
    } else {
      p = new Promise((resolve, reject) => {
        RestClient.instance().get(uri)
          .then(function (response) {
            CmsService._timezoneHelperData = response.data;
            resolve(CmsService._timezoneHelperData);
          })
          .catch(function (error) {
            let rc = ErrorHandler.handleError(error);
            reject(Error(rc));
          });
      });

      PromiseManager.set(p, uri);
      return p;
    }
  }

  static getSiteContent () {
    if (ContentHelper.siteContentInitialized()) {
      return new Promise((resolve) => {
        resolve();
      });
    }

    let uri = 'https://nexuspad.com/i18n/site_en_us.json';
    let p = PromiseManager.get(uri);

    if (p) {
      return p;
    } else {
      p = new Promise((resolve, reject) => {
        axios.get(uri)
          .then(function (response) {
            ContentHelper.setSiteContent(response.data);
            resolve();
          })
          .catch(function (error) {
            let rc = ErrorHandler.handleError(error);
            reject(Error(rc));
          });
      });

      PromiseManager.set(p, uri);
      return p;
    }
  }
}
