import Account from '../datamodel/Account'
import NPError from '../datamodel/NPError'
import ServiceHelper from './ServiceHelper'
import PromiseManager from '../util/PromiseManager'
import RestClient from '../util/RestClient'
import CommonUtils from '../util/CommonUtils'
import ErrorHandler from '../util/ErrorHandler'
import UserServiceData from './UserServiceData'
import StorageUtils from '../util/StorageUtils'
import PreferenceService from './PreferenceService'
import NPUser from '../datamodel/NPUser';
import AppManager from '../util/AppManager';

export default class AccountService {
  static _currentUser = null;

  static currentSession () {
    if (AccountService._currentUser === null || !AccountService._currentUser.sessionId) {
      throw new NPError(NPError.INVALID_SESSION);
    } else {
      return AccountService._currentUser.sessionId;
    }
  }

  static isLoggedIn () {
    if (AccountService._currentUser === null || !AccountService._currentUser.sessionId) {
      return false;
    } else {
      return true;
    }
  }

  static currentUser () {
    return AccountService._currentUser;
  }

  /**
   * return the current account object.
   * if a session id is not provided, look for it in the service object; or get the value from cookie.
   */
  static hello (sessionId) {
    if (!sessionId) {
      // user object is in scope, return it.
      if (AccountService._currentUser !== null && AccountService._currentUser.sessionId) {
        return new Promise((resolve) => {
          resolve(AccountService._currentUser);
        });
      }
    }

    // check if a session id is stored in cookie
    if (!sessionId) {
      sessionId = StorageUtils.getCookieValue(StorageUtils.SESSION_COOKIE_NAME);
    }

    if (!sessionId) {
      // no session id, reject with NPError.NO_SESSION.
      // note that for some routes, this is OK.
      // NPError.INVALID_SESSION is handled in ErrorHandler, and it'll result redirection to the login page.
      return new Promise((resolve, reject) => {
        reject(new NPError(NPError.NO_SESSION));
      });
    }

    let uri = CommonUtils.sprintf(ServiceHelper.accountHello, sessionId);
    let p = PromiseManager.get(uri);

    if (p) {
      return p;
    } else {
      p = new Promise((resolve, reject) => {
        RestClient.instance().get(uri)
          .then(function (response) {
            // Parse application level response data
            if (response.data.errorCode) {
              reject(new NPError(response.data.errorCode));
            } else {
              AccountService._currentUser = new Account(response.data.user);
              StorageUtils.saveCookie(StorageUtils.SESSION_COOKIE_NAME, AccountService._currentUser.sessionId);
              PreferenceService.init(AccountService._currentUser.preference);
              
              if (AccountService._currentUser.servicehost) {
                RestClient.changeServiceHost(AccountService._currentUser.servicehost);
              }

              resolve(AccountService._currentUser);
            }
          })
          .catch(function (error) {
            let rc = ErrorHandler.handleError(error);
            reject(new NPError(rc));
          });
      });

      PromiseManager.set(p, uri);
      return p;
    }
  }

  static login (login, password, uuid) {
    let uri = ServiceHelper.login;
    let p = PromiseManager.get(uri, 'POST');

    let userServiceData = new UserServiceData();
    userServiceData.user = new NPUser();

    userServiceData.user.auth.login = login;
    userServiceData.user.auth.password = password;
    userServiceData.user.auth.uuid = uuid;

    if (p) {
      return p;
    } else {
      p = new Promise((resolve, reject) => {
        RestClient.instance().post(uri, userServiceData)
          .then(function (response) {
            // Parse application level response data
            if (response.data.errorCode) {
              reject(new NPError(response.data.errorCode));
            } else {
              AccountService._currentUser = new Account(response.data.user);
              StorageUtils.saveCookie(StorageUtils.SESSION_COOKIE_NAME, AccountService._currentUser.sessionId);
              PreferenceService.init(AccountService._currentUser.preference);

              if (AccountService._currentUser.servicehost) {
                RestClient.changeServiceHost(AccountService._currentUser.servicehost);
              }

              resolve(AccountService._currentUser);
            }
          })
          .catch(function (error) {
            let rc = ErrorHandler.handleError(error);
            reject(new NPError(rc));
          });
      });

      PromiseManager.set(p, uri, 'POST');
      return p;
    }
  }

  static logout () {
    // data cleanse. may need a separate method for them.
    let sessionId = null;
    if (AccountService._currentUser && AccountService._currentUser.sessionId) {
      sessionId = AccountService._currentUser.sessionId;
    } else {
      sessionId = StorageUtils.getCookieValue(StorageUtils.SESSION_COOKIE_NAME);
    }

    // already logged out
    if (!sessionId) {
      return new Promise((resolve) => {
        resolve();
      });
    }

    // send request to logout
    return new Promise((resolve, reject) => {
      RestClient.instance(sessionId).get(ServiceHelper.logout)
        .then(function () {
          AppManager.cleanup();
          resolve();
        })
        .catch(function (error) {
          reject(error);
        });
    });
  }

  static register (email, password, displayName, timezoneName, uuid) {
    let uri = ServiceHelper.register;
    let p = PromiseManager.get(uri, 'POST');

    let userServiceData = new UserServiceData();
    userServiceData.user = new NPUser();
    userServiceData.user.email = email;
    userServiceData.user.displayName = displayName;
    userServiceData.user.auth.password = password;

    if (uuid) {
      userServiceData.user.auth.uuid = uuid;
    }

    if (timezoneName) {
      userServiceData.user.preference.timezoneName = timezoneName;
    }

    if (p) {
      return p;
    } else {
      p = new Promise((resolve, reject) => {
        RestClient.instance().post(uri, userServiceData)
          .then(function (response) {
            // Parse application level response data
            if (response.data.errorCode) {
              reject(new NPError(response.data.errorCode));
            } else {
              AccountService._currentUser = new Account(response.data.user);
              resolve(AccountService._currentUser);
            }
          })
          .catch(function (error) {
            let rc = ErrorHandler.handleError(error);
            reject(new NPError(rc));
          });
      });

      PromiseManager.set(p, uri, 'POST');
      return p;
    }
  }

  static checkResetPasswordVerificationCode (verificationCode) {
    let userServiceData = new UserServiceData();
    userServiceData.user = new NPUser();
    userServiceData.user.auth.passwordResetVerificationCode = verificationCode;

    let uri = ServiceHelper.checkResetPasswordVerificationCode;
    let p = new Promise((resolve, reject) => {
      RestClient.instance().post(uri, userServiceData)
        .then(function (response) {
          // Parse application level response data
          if (response.data.errorCode) {
            reject(new NPError(response.data.errorCode));
          } else {
            if (response.data.actionResult === 'SUCCESS') {
              resolve(true);
            } else {
              console.log('reset password result', response.data);
              resolve(false);
            }
          }
        })
        .catch(function (error) {
          let rc = ErrorHandler.handleError(error);
          reject(new NPError(rc));
        });
    });

    PromiseManager.set(p, uri, 'POST');
    return p;
  }

  static changePassword ({ currentPassword = '', verificationCode = '', password }) {
    let userServiceData = new UserServiceData();
    userServiceData.user = new NPUser();

    let sessionId = '';
    if (currentPassword) {
      userServiceData.user.auth.currentPassword = currentPassword;
      sessionId = AccountService.currentSession();
      var uri = ServiceHelper.password;
    } else if (verificationCode) {
      userServiceData.user.auth.passwordResetVerificationCode = verificationCode;
      uri = ServiceHelper.resetPassword;
    }

    userServiceData.user.auth.password = password;

    let p = new Promise((resolve, reject) => {
      RestClient.instance(sessionId).post(uri, userServiceData)
        .then(function (response) {
          // Parse application level response data
          if (response.data.errorCode) {
            reject(new NPError(response.data.errorCode));
          } else {
            if (response.data.actionResult === 'SUCCESS') {
              resolve(true);
            } else {
              console.log('reset password result', response.data);
              resolve(false);
            }
          }
        })
        .catch(function (error) {
          let rc = ErrorHandler.handleError(error);
          reject(new NPError(rc));
        });
    });

    PromiseManager.set(p, uri, 'POST');
    return p;
  }

  static changeUsername (newUserName) {
    let userServiceData = new UserServiceData();
    userServiceData.user = new NPUser();
    userServiceData.user.userName = newUserName;

    let uri = ServiceHelper.userName;
    let p = new Promise((resolve, reject) => {
      RestClient.instance(AccountService.currentSession()).post(uri, userServiceData)
        .then(function (response) {
          // Parse application level response data
          if (response.data.errorCode) {
            reject(new NPError(response.data.errorCode));
          } else {
            AccountService._currentUser.userName = response.data.user.userName;
            resolve(AccountService._currentUser);
          }
        })
        .catch(function (error) {
          let rc = ErrorHandler.handleError(error);
          reject(new NPError(rc));
        });
    });

    PromiseManager.set(p, uri, 'POST');
    return p;
  }

  static changeDisplayname (newDisplayName) {
    let userServiceData = new UserServiceData();
    userServiceData.user = new NPUser();
    userServiceData.user.displayName = newDisplayName;

    let uri = ServiceHelper.displayName;
    let p = new Promise((resolve, reject) => {
      RestClient.instance(AccountService.currentSession()).post(uri, userServiceData)
        .then(function (response) {
          // Parse application level response data
          if (response.data.errorCode) {
            reject(new NPError(response.data.errorCode));
          } else {
            AccountService._currentUser.displayName = response.data.user.displayName;
            resolve(AccountService._currentUser);
          }
        })
        .catch(function (error) {
          let rc = ErrorHandler.handleError(error);
          reject(new NPError(rc));
        });
    });

    PromiseManager.set(p, uri, 'POST');
    return p;
  }

  static requestPasswordReset (email) {
    let userServiceData = new UserServiceData();
    userServiceData.user = new NPUser();
    userServiceData.user.email = email;

    let uri = ServiceHelper.requestPasswordReset;
    let p = new Promise((resolve, reject) => {
      RestClient.instance().post(uri, userServiceData)
        .then(function (response) {
          // Parse application level response data
          if (response.data.errorCode) {
            reject(new NPError(response.data.errorCode));
          } else {
            if (response.data['actionResult'] === 'SUCCESS') {
              resolve();
            }
          }
        })
        .catch(function (error) {
          let rc = ErrorHandler.handleError(error);
          reject(new NPError(rc));
        });
    });

    PromiseManager.set(p, uri, 'POST');
    return p;
  }

  static enableDataEncryption () {
    let uri = '/user/enabledataencryption';
    let p = new Promise((resolve, reject) => {
      RestClient.instance(AccountService.currentSession()).post(uri)
        .then(function (response) {
          AccountService._currentUser = new Account(response.data.user);
          resolve(AccountService._currentUser);
        })
        .catch(function (error) {
          let rc = ErrorHandler.handleError(error);
          reject(new NPError(rc));
        });
    });

    PromiseManager.set(p, uri, 'POST');
    return p;
  }

  static rebuildSearchIndex () {
    let uri = '/search/rebuild';
    let p = new Promise((resolve, reject) => {
      RestClient.instance(AccountService.currentSession()).post(uri)
        .then(function () {
          resolve();
        })
        .catch(function (error) {
          let rc = ErrorHandler.handleError(error);
          reject(new NPError(rc));
        });
    });

    PromiseManager.set(p, uri, 'POST');
    return p;
  }

  static deleteAccount () {
    // send request to logout
    return new Promise((resolve, reject) => {
      RestClient.instance(AccountService.currentSession()).delete(ServiceHelper.acct)
        .then(function () {
          AppManager.cleanup();
          resolve();
        })
        .catch(function (error) {
          reject(error);
        });
    });
  }

  static cleanup () {
    AccountService._currentUser = null;
  }
}
