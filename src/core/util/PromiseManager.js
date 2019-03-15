export default class PromiseManager {
  static promisePool = {};

  static get (url, method) {
    if (!method) method = 'GET';
    let key = url + method;
    PromiseManager.cleanPool();

    if (PromiseManager.promisePool[key]) {
      return PromiseManager.promisePool[key].promise;
    } else {
      return null;
    }
  }

  static set (promise, url, method) {
    if (!method) method = 'GET';
    let key = url + method;
    PromiseManager.promisePool[key] = new PromiseWrap(promise, key);
  }

  static cleanPool () {
    for (let k in PromiseManager.promisePool) {
      if (PromiseManager.promisePool[k] !== null && PromiseManager.promisePool[k].expires()) {
        delete PromiseManager.promisePool[k];
      }
    }
  }
}

class PromiseWrap {
  constructor (promise, key) {
    this.promise = promise;
    this.key = key;
    this.timestamp = Date.now();
  }

  expires () {
    let currentTs = Date.now();
    if (currentTs - this.timestamp > 2000) {
      return true;
    }
    return false;
  }
}
