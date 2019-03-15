import Cookies from 'js-cookie';

export default class StorageUtils {
  static PREFERENCE = 'preference';
  static SESSION_COOKIE_NAME = '_t';

  static get (name) {
    let value = window.sessionStorage.getItem(name);
    if (value) {
      return value;
    }
    return null;
  }

  static getCookieValue (name) {
    return Cookies.get(name);
  }

  static saveCookie (name, value) {
    Cookies.set(name, value);
  }

  static deleteCookie (name) {
    Cookies.remove(name);
  }

  static saveToSession (name, value) {
    window.sessionStorage.setItem(name, JSON.stringify(value));
  }

  static getFromSession (name) {
    let jsonStr = window.sessionStorage.getItem(name);
    if (jsonStr) {
      return JSON.parse(jsonStr);
    }
    return null;
  }

  static deleteFromSession (name) {
    window.sessionStorage.removeItem(name);
  }

  static syncSession () {
  }

  static deleteAll () {
    window.sessionStorage.clear();
  }
}
