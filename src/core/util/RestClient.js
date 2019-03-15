import axios from 'axios'
import AppManager from './AppManager';
import EventManager from './EventManager';
import AppEvent from './AppEvent';
import NPError from '../datamodel/NPError';

export default class RestClient {
  static _axiosInstance = null;
  static apiUrl = '';

  static get (fullUrl) {
    return axios.get(fullUrl);
  }

  static instance (sessionId, optional = { timeout: 3000, timezone: '', locale: '', otoken: '' }) {
    if (!this.apiUrl) {
      throw new NPError(NPError.ABORT);
    }

    if (!sessionId) sessionId = '';

    if (this._axiosInstance !== null && this._axiosInstance.defaults.headers['utoken'] !== sessionId) {
      console.log('[RestClient] reset...because the sessionId has changed');
      this._axiosInstance = null;
    }

    if (this._axiosInstance === null) {
      let headers = { 'utoken': sessionId };
      if (optional.timezone) headers['timezone'] = optional.timezone;
      if (optional.locale) headers['locale'] = optional.locale;
      if (optional.otoken) {
        headers['otoken'] = optional.otoken;
      } else {
        headers['otoken'] = '';
      }
      
      this._axiosInstance = axios.create({
        baseURL: this.apiUrl,
        timeout: optional.timeout,
        headers: headers
      });

      // response interceptor
      // Re-try once if there is certain error.
      this._axiosInstance.interceptors.response.use(
        (data) => {
          EventManager.publish(AppEvent.LOADING, false);
          return data;
        },
        (error) => {
          if (error.code === 'ECONNABORTED') {
            console.log('Retry request...', error.config.url);
            return axios.request(error.config);
          }
          EventManager.publish(AppEvent.LOADING, false);
          return Promise.reject(error);
        }
      );

      this._axiosInstance.interceptors.request.use(function (config) {
        // before request is sent
        EventManager.publish(AppEvent.LOADING, true);
        return config;
      }, function (error) {
        // request error
        EventManager.publish(AppEvent.LOADING, false);
        return Promise.reject(error);
      });

    } else {
      this._axiosInstance.defaults.headers['utoken'] = sessionId;
      if (optional.timezone) {
        this._axiosInstance.defaults.headers['timezone'] = optional.timezone;
      }
      if (optional.locale) {
        this._axiosInstance.defaults.headers['locale'] = optional.locale;
      }
      if (optional.otoken) {
        this._axiosInstance.defaults.headers['otoken'] = optional.otoken;
      } else {
        this._axiosInstance.defaults.headers['otoken'] = '';
      }
    }

    if (!AppManager.uuid) {
      console.warn('[RestClient] uuid not available');
    }

    this._axiosInstance.defaults.headers['uuid'] = AppManager.uuid;

    return this._axiosInstance;
  }

  static instanceForUploading () {
    const instance = axios.create();
    instance.CancelToken = axios.CancelToken;
    return instance;
  }

  static destroy () {
    this._axiosInstance = null;
  }
}
