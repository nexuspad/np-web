import BaseService from './BaseService';
import AccountService from './AccountService';
import PromiseManager from '../util/PromiseManager';
import RestClient from '../util/RestClient';
import ErrorHandler from '../util/ErrorHandler'
import TimelineList from '../datamodel/TimelineList';

export default class TimelineListService extends BaseService {
  static activities (refresh = false) {
    var uri = '/user/activities';

    let listQuery;

    let p = PromiseManager.get(uri);

    if (p && refresh === false) {
      return p;
    } else {
      p = new Promise((resolve, reject) => {
        RestClient.instance(AccountService.currentSession(), BaseService.getHeaders({listQuery: listQuery}))
        .get(uri)
          .then(function (response) {
            if (response.data.errorCode) {
              reject(Error(response.data.errorCode));
            } else {
              resolve(new TimelineList(response.data.timelineList));
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