import NPEntry from "../datamodel/NPEntry";
import NPFolder from "../datamodel/NPFolder";
import NPModule from "../datamodel/NPModule";
import BulkOperation from "../datamodel/BulkOperation";

export default class AppEvent {
  static ACCOUNT_CREATION_FAILURE = 'ACCOUNT_CREATION_FAILURE';
  static ACCOUNT_LOGIN_SUCCESS = 'ACCOUNT_LOGIN_SUCCESS';
  static ACCOUNT_LOGIN_FAILURE = 'ACCOUNT_LOGIN_FAILURE';
  static ACCOUNT_SESSION_ACTIVE = 'ACCOUNT_SESSION_ACTIVE';
  static ACCOUNT_SESSION_INACTIVE = 'ACCOUNT_SESSION_INACTIVE';
  static ACCOUNT_PASSWORD_UPDATE = 'ACCOUNT_PASSWORD_UPDATE';
  static ACCOUNT_TIMEZONE_UPDATE = 'ACCOUNT_TIMEZONE_UPDATE';
  static ACCOUNT_DISPLAYNAME_UPDATE = 'ACCOUNT_DISPLAYNAME_UPDATE';
  static ACCOUNT_USERNAME_UPDATE = 'ACCOUNT_USERNAME_UPDATE';
  static ACCOUNT_PASSWORD_RESET_REQUEST = 'ACCOUNT_PASSWORD_RESET_REQUEST';
  static ACCOUNT_MODULE_SETTINGS_UPDATE = 'ACCOUNT_MODULE_SETTINGS_UPDATE';

  static ACCOUNT_DELETED = 'ACCOUNT_DELETED';

  static SHOW_UPLOADER = 'SHOW_UPLOADER';

  static MODULE_EXPORT_FAILED = 'MODULE_EXPORT_FAILED';
  static MODULE_EXPORT_IN_PROGRESS = 'MODULE_EXPORT_IN_PROGRESS';

  static ENTRY_UPDATE = 'ENTRY_UPDATE';
  static ENTRY_DELETE = 'ENTRY_DELETE';
  static ENTRY_RESTORE = 'ENTRY_RESTORE';
  static ENTRY_MOVE = 'ENTRY_MOVE';

  static FOLDER_UPDATE = 'FOLDER_UPDATE';
  static FOLDER_DELETE = 'FOLDER_DELETE';

  static EMPTY_TRASH = 'EMPTY_TRASH';

  static FOLDER_RELOAD_EVENT = 'FOLDER_RELOAD_EVENT';
  static SHARED_FOLDER_RELOAD_EVENT = 'SHARED_FOLDER_RELOAD_EVENT';

  static LOADING = 'LOADING';
  static REFRESH_LIST = 'REFRESH_LIST';
  static EMPTY_LIST = 'EMPTY_LIST';

  // the pre-defined AppEvent types
  type;
  // error or success message
  message;
  // Error object
  error;
  // affected object. this can be an NPEntry, NPFolder
  affectedItem;

  static ofIntention (eventType, param) {
    let appEvent = new AppEvent();
    appEvent.type = eventType;
    appEvent.affectedItem = param;
    return appEvent;
  }

  static ofSuccess (eventType, affectedItem) {
    let appEvent = new AppEvent();
    appEvent.type = eventType;
    appEvent.affectedItem = affectedItem;
    return appEvent;
  }

  static ofFailure (eventType, error, affectedItem) {
    let appEvent = new AppEvent();
    appEvent.type = eventType;
    appEvent.error = error;
    if (affectedItem) {
      appEvent.affectedItem = affectedItem;
    }
    return appEvent;
  }

  static ofInformation (eventType, message) {
    let appEvent = new AppEvent();
    appEvent.type = eventType;
    if (message) {
      appEvent.message = message;
    } else {
      switch (eventType) {
        case this.EMPTY_LIST:
          appEvent.message = 'Nothing in here';
      }
    }
    return appEvent;
  }

  messageKey () {
    let key;
    if (this.affectedItem instanceof NPEntry) {
      key = NPModule.entryName(this.affectedItem.moduleId);
    } else if (this.affectedItem instanceof NPFolder) {
      key = 'folder';
    } else if (this.affectedItem instanceof BulkOperation) {
      // plural form for the entries
      key = NPModule.entryName(this.affectedItem.folder.moduleId) + 's';
    }

    if (key) {
      key += '_' + this.type.toLowerCase();
    } else {
      key = this.type.toLowerCase();
    }

    if (this.affectedItem) {
      if (this.error) {
        if (!this.error.errorCode) {
          key += '_failure';
        } else {
          key += this.error.errorCode.toLowerCase();
        }
      } else {
        key += '_success';
      }
    }

    return key;
  }

  isForEntry () {
    if (this.affectedItem && this.affectedItem.entryId) {
      return true;
    }
    return false;
  }
}
