import NPModule from "../datamodel/NPModule";

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
    let key = original.replace(/^a-zA-Z0-9 /g, '').replace(/\s/g, '_');
    let value = this.value(key);
    if (value === key) {
      return key;
    } else {
      return value;
    }
  }

  static value (key) {
    if (this._siteContent && this._siteContent[key]) {
      return this._siteContent[key];
    }
    return key;
  }

  static entryPrefixMessage (moduleId, key) {
    return NPModule.entryName(moduleId) + '_' + key;
  }

  static appEventMessage (appEvent) {
    return this.message(appEvent.messageKey());
  }
}