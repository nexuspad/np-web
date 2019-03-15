import AccountService from './AccountService'
import ServiceHelper from './ServiceHelper'
import PromiseManager from '../util/PromiseManager'
import RestClient from '../util/RestClient'
import ErrorHandler from '../util/ErrorHandler'
import UserServiceData from './UserServiceData';
import UserPreference from '../datamodel/UserPreference';
import StorageUtils from '../util/StorageUtils';
import NPUser from '../datamodel/NPUser';
import Account from '../datamodel/Account';

export default class PreferenceService {
  static _preference = null;

  // this is from the browser
  static _activeTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  static init (preference) {
    PreferenceService._preference = preference;
    StorageUtils.saveToSession(StorageUtils.PREFERENCE, preference);
  }

  static getPreference () {
    if (PreferenceService._preference === null) {
      PreferenceService._preference = new UserPreference(StorageUtils.getFromSession(StorageUtils.PREFERENCE));
    }
    return PreferenceService._preference;
  }

  static getCalendarDefaultDate () {
    console.log('in get', this._preference);
    return this.getPreference().getCalendarDefaultDate();
  }

  static setCalendarDefaultDate (ymd) {
    this.getPreference().setCalendarDefaultDate(ymd);
    console.log('in set', this._preference);
  }

  static getActiveTimezone () {
    return this._activeTimezone
  }

  static getLocale () {
    if (this._preference) {
      return this._preference.locale;
    }
    return '';
  }

  static updateViewPreference () {
    let uri = ServiceHelper.preference + '/view';
    let p = PromiseManager.get(uri);

    let userObj = new NPUser(AccountService.currentUser());
    userObj.preference = PreferenceService._preference;
    let userServiceData = UserServiceData.of(userObj);

    if (p) {
      return p;
    } else {
      p = new Promise((resolve, reject) => {
        RestClient.instance(AccountService.currentSession()).post(uri, userServiceData)
          .then(function (response) {
            // Parse application level response data
            if (response.data.errorCode) {
              reject(Error(response.data.errorCode));
            } else {
              let userObj = new Account(response.data.user);
              PreferenceService._preference = userObj.preference;
              StorageUtils.saveToSession(StorageUtils.PREFERENCE, PreferenceService._preference);
            }
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

  static updateTimePreference ({ locale = '', timezone = '', dateDisplayFormat = '' }) {
    let preference = new UserPreference();
    preference.timezoneName = timezone;
    preference.locale = locale;
    preference.dateDisplayFormat = dateDisplayFormat;

    let userObj = new NPUser(AccountService.currentUser());
    userObj.preference = preference;
    let userServiceData = UserServiceData.of(userObj);

    let uri = ServiceHelper.preference;
    let p = PromiseManager.get(uri);

    if (p) {
      return p;
    } else {
      p = new Promise((resolve, reject) => {
        RestClient.instance(AccountService.currentSession()).post(uri, userServiceData)
          .then(function (response) {
            // Parse application level response data
            if (response.data.errorCode) {
              reject(Error(response.data.errorCode));
            } else {
              let userObj = new Account(response.data.user);
              AccountService._currentUser.preference = userObj.preference;
              resolve(AccountService._currentUser);
            }
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

  static enableDebugging (debugging) {
    window.npDebugging = debugging;
  }
}
