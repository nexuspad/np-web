import NPError from '../datamodel/NPError';
import EventManager from './EventManager';
import AppEvent from './AppEvent';
import StorageUtils from './StorageUtils';

export default class ErrorHandler {
  /**
   * handle axios error, like this one below:
   {
     "config": {
       "transformRequest": {},
       "transformResponse": {},
       "timeout": 3000,
       "xsrfCookieName": "XSRF-TOKEN",
       "xsrfHeaderName": "X-XSRF-TOKEN",
       "maxContentLength": -1,
       "headers": {
         "Accept": "application/json, text/plain,",
         "utoken": "5976a1a40a9fc4c317812ad6790c31618d5e8678"
       },
       "baseURL": "http://localhost:8080/api",
       "method": "get",
       "url": "http://localhost:8080/api/docs?type=401&folder_id=0&page=1"
     },
     "code": "ECONNABORTED",
     "request": {}
   }
   */
  static handleError (error) {
    if (error instanceof NPError) {
      console.error('[ErrorHandler] application throws a NPError', error)
      return error;
    } else {
      if (error.code === 'ECONNABORTED') {
        console.error('[ErrorHandler] web service call error', error.code, error.config.url);
      }
      if (error.response) {
        // The request was made and the server responded with a status code that falls out of the range of 2xx
        console.error('[ErrorHandler] web service responded error status %s, %s', error.response.status, JSON.stringify(error.response.data));
        if (error.response.status === 401) {
          ErrorHandler._handleInvalidSession();
        }
        return error.response.status;
      } else if (error.request) {
        // The request was made but no response was received - usually this is a timeout situation
        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
        // http.ClientRequest in node.js
        console.error('[ErrorHandler] web service call the request was made but no response was received. request: %s', JSON.stringify(error.request._currentUrl));
        return NPError.TIMEOUT;
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('[ErrorHandler] web service call error: %s', error);
        return NPError.UNKNOWN;
      }
    }
  }

  /// this is specifically for handling the 401 denied situation from API calls.
  static _handleInvalidSession () {
    console.error('[ErrorHandler] api access denied');
    StorageUtils.deleteCookie(StorageUtils.SESSION_COOKIE_NAME);
    // app.js has listener to this event
    EventManager.publish(AppEvent.ACCOUNT_SESSION_INACTIVE);
  }
}
