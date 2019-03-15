import BaseService from './BaseService';
import ServiceHelper from './ServiceHelper';
import PromiseManager from '../util/PromiseManager';
import RestClient from '../util/RestClient';
import ErrorHandler from '../util/ErrorHandler'
import AccountService from './AccountService';
import NPUser from '../datamodel/NPUser';
import UserServiceData from './UserServiceData';

export default class UserLookupService extends BaseService {
  static _users = new Map();

  static getUser ({ userId = 0, userEmail = '', userName = '' } = {}) {
    let lookupKey = '';
    let userObj = new NPUser();

    if (userId > 0) {
      lookupKey = userId;
      userObj.userId = userId;
    } else if (userEmail) {
      lookupKey = userEmail;
      userObj.email = userEmail;
    } else if (userName) {
      lookupKey = userName;
      userObj.userName = userName;
    }

    if (UserLookupService._users.has(lookupKey)) {
      let p = new Promise((resolve) => {
        resolve(UserLookupService._users.get(lookupKey));
      });
      return p;
    }

    return UserLookupService.searchUser(userObj);
  }

  static getUserName (userId) {
    if (UserLookupService._users.has(userId)) {
      return UserLookupService._users.get(userId).userName;
    }
  }

  static getUserDisplayName (userId) {
    if (UserLookupService._users.has(userId)) {
      return UserLookupService._users.get(userId).badge.name;
    }
    return 'not found';
  }

  static searchUser (userObj) {
    let uri = ServiceHelper.userLookup;
    let p = PromiseManager.get(uri);

    if (p) {
      return p;
    } else {
      p = new Promise((resolve, reject) => {
        RestClient.instance(AccountService.currentSession()).post(uri, UserServiceData.of(userObj))
          .then(function (response) {
            if (response.data.errorCode) {
              reject(Error(response.data.errorCode));
            } else {
              resolve(new NPUser(response.data.user));
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

  static addUsers (users) {
    users.forEach(u => {
      UserLookupService._users.set(u.userId, u);
      UserLookupService._users.set(u.email, u);
      UserLookupService._users.set(u.userName, u);
    });
  }
}
