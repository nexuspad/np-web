import NPModule from './NPModule';
import TimeUtil from '../util/TimeUtil';

export default class UserPreference {
  debug = true;

  docFormat = 'HTML';

  firstDayOfWeek = 7;
  locale = '';
  userName = '';
  timezoneName = '';
  moduleSettings = null;
  viewPreferences = {};

  constructor (data) {
    if (data) {
      this.firstDayOfWeek = data['firstDayOfWeek'];
      if (data['locale']) {
        this.locale = data['locale'].replace('_', '-');
      }
      this.userName = data['userName'];
      this.timezoneName = data['timezoneName'];

      if (data['viewPreferences']) {
        this.viewPreferences = data['viewPreferences'];
      }

      if (data['moduleSettings']) {
        this.moduleSettings = data['moduleSettings'];
      }
    }

    if (this.moduleSettings === null) {
      this.moduleSettings = {};
      this.moduleSettings[NPModule.codeForId(NPModule.CONTACT)] = true;
      this.moduleSettings[NPModule.codeForId(NPModule.CALENDAR)] = true;
      this.moduleSettings[NPModule.codeForId(NPModule.DOC)] = true;
      this.moduleSettings[NPModule.codeForId(NPModule.BOOKMARK)] = true;
      this.moduleSettings[NPModule.codeForId(NPModule.PHOTO)] = true;
    }
  }

  getCalendarDefaultDate () {
    if (this.viewPreferences && this.viewPreferences.calendar && this.viewPreferences.calendar.defaultDate) {
      return this.viewPreferences.calendar.defaultDate;
    }
    return TimeUtil.npLocalDate(new Date());
  }

  setCalendarDefaultDate (ymd) {
    let calViewPref = this.viewPreferences.calendar;
    if (!calViewPref) {
      calViewPref = {};
    }
    calViewPref['defaultDate'] = ymd;
    this.viewPreferences.calendar = calViewPref;
  }

  getCalendarDefaultView () {
    if (this.viewPreferences && this.viewPreferences.calendar.view) {
      return this.viewPreferences.calendar.view;
    } else {
      return 'month';
    }
  }

  getTimezoneName () {
    if (this.timezoneName) {
      return this.timezoneName;
    } else {
      return Intl.DateTimeFormat().resolvedOptions().timeZone;
    }
  }

  getLastVisit () {
    if (this.viewPreferences && this.viewPreferences['lastVisit']) {
      return this.viewPreferences['lastVisit'];
    }
    return null;
  }

  updateLastVisit (moduleId) {
    let visit = { 'moduleId': moduleId };
    this.viewPreferences['lastVisit'] = visit;
  }

  isFolderOpen (folderObj) {
    // always opens root
    if (folderObj.isMyFolder() && folderObj.folderId === 0) {
      return true;
    }
    let moduleCode = NPModule.codeForId(folderObj.moduleId);

    if (this.viewPreferences[moduleCode] && this.viewPreferences[moduleCode].folders) {
      let folderIdArr = this.viewPreferences[moduleCode].folders.opened;
      let key = folderObj.folderId;
      if (!folderObj.isMyFolder()) {
        key = folderObj.getOwnerId() + '/' + folderObj.folderId;
      }
      if (folderIdArr && folderIdArr.indexOf(key) !== -1) {
        return true;
      }
    }
    return false;
  }

  isFolderSelected (folderObj) {
    if (this.selectedFolder === folderObj.folderId) {
      return true;
    }
    return false;
  }

  toggleFolder (folderObj, open) {
    let moduleCode = NPModule.codeForId(folderObj.moduleId);

    if (!this.viewPreferences[moduleCode]) {
      this.viewPreferences[moduleCode] = {
        'folders': {
          'opened': []
        }
      };
    } else if (!this.viewPreferences[moduleCode]['folders']) {
      this.viewPreferences[moduleCode]['folders'] = {
        'opened': []
      };
    }

    let folderIdArr = this.viewPreferences[moduleCode].folders.opened;
    if (!folderIdArr) {
      folderIdArr = [];
    }

    let key = folderObj.folderId;
    if (!folderObj.isMyFolder()) {
      key = folderObj.getOwnerId() + '/' + folderObj.folderId;
    }

    if (open) {
      if (folderIdArr.indexOf(key) === -1) {
        folderIdArr.push(key);
      }
    } else {
      let len = folderIdArr.length;
      for (let i = 0; i < len; i++) {
        if (folderIdArr[i] === key) {
          folderIdArr.splice(i, 1);
          break;
        }
      }
    }

    this.viewPreferences[moduleCode].folders.opened = folderIdArr;
  }
}
