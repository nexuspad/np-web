export default class ContentHelper {
  static _siteContent;

  static siteContentInitialized () {
    if (this._siteContent && this._siteContent['login']) {
      return true;
    }
    return false;
  }

  static setSiteContent (content) {
    this._siteContent = content;
  }

  static translate (original) {
    let key = original.replace(/\W/g, '').replace(' ', '_');
    let value = this.message(key);
    if (value === key) {
      return original;
    } else {
      return key;
    }
  }

  static message (key) {
    if (this._siteContent && this._siteContent[key]) {
      return this._siteContent[key];
    }
    return key;
  }

  static appEventMessage (appEvent) {
    return this.message(appEvent.messageKey());
  }
}