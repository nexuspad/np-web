import EntryService from './EntryService';
import PromiseManager from '../util/PromiseManager'
import AccountService from './AccountService'
import RestClient from '../util/RestClient'
import ErrorHandler from '../util/ErrorHandler'
import ServiceHelper from './ServiceHelper'

export default class ContactService extends EntryService {
  static contactLookup = {};

  // marked for deprecation
  static lookupContact (refresh) {
    if (refresh === false) {
      if (ContactService.contactLookup.size() > 0) {
        return this.contactLookup;
      }
    }

    let uri = ServiceHelper.contactLookup;

    let p = PromiseManager.get(uri);

    if (p) {
      return p;
    } else {
      p = new Promise((resolve, reject) => {
        RestClient.instance(AccountService.currentSession()).get(uri)
          .then(function (response) {
            if (response.data.errorCode) {
              reject(Error(response.data.errorCode));
            } else {
              resolve(response.data.data);
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
}
