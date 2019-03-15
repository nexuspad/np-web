import './AppEvent';

export default class EventManager {
  static listeners = new Map();

  static subscribe (eventName, callback) {
    EventManager.listeners.has(eventName) || EventManager.listeners.set(eventName, []);

    let callbacks = EventManager.listeners.get(eventName);
    let index = -1;

    if (callbacks && callbacks.length) {
      callbacks.forEach((element, currentIndex) => {
        if (typeof element === 'function' && element === callback) {
          index = currentIndex;
        }
      });
    }
    if (index === -1) {
      EventManager.listeners.get(eventName).push(callback);
    }
  }

  static unSubscribe (eventName, callback) {
    let callbacks = EventManager.listeners.get(eventName);
    let index = -1;

    if (callbacks && callbacks.length) {
      callbacks.forEach((element, currentIndex) => {
        if (typeof element === 'function' && element === callback) {
          index = currentIndex;
        }
      });
      if (index !== -1) {
        callbacks.splice(index, 1);
        EventManager.listeners.set(eventName, callbacks);
        return true;
      }
    }

    return false;
  }

  static publishAppEvent (appEvent) {
    EventManager.publish(appEvent.type, appEvent);
  }

  static publish (eventName, ...args) {
    let callbacks = EventManager.listeners.get(eventName);
    if (callbacks && callbacks.length > 0) {
      callbacks.forEach((callbackFunc) => {
        if (callbackFunc) {
          callbackFunc(...args);
        } else {
          console.log('EveneManage: invalid callback function');
        }
      });
      return true;
    }
    return false;
  }
}
