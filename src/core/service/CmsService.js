import ServiceHelper from './ServiceHelper'
import PromiseManager from '../util/PromiseManager'
import RestClient from '../util/RestClient'
import ErrorHandler from '../util/ErrorHandler'

export default class CmsService {
  static _timezoneHelperData;
  static _cmsContent = {};

  static getCmsValue (text) {
    let cmsKey = text;
    if (text.indexOf(' ') !== -1) {
      cmsKey = cmsKey.replace(/ /g, '_');
    }
    console.log(cmsKey);
    if (this._cmsContent && this._cmsContent[cmsKey]) {
      return this._cmsContent[cmsKey];
    } else {
      return text;
    }
  }

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

  static getCmsContent () {
    if (this._cmsContent) {
      let p = new Promise((resolve) => {
        resolve(this._cmsContent);
      });
      return p;
    }

    let uri = ServiceHelper.cms + '/content';
    console.log(uri);
    let p = PromiseManager.get(uri);

    if (p) {
      return p;
    } else {
      p = new Promise((resolve, reject) => {
        RestClient.instance().get(uri)
          .then(function (response) {
            this._cmsContent = response.data;
            resolve(this._cmsContent);
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
