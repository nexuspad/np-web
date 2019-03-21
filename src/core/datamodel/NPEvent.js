import NPEntry from './NPEntry';
import TimeUtil from '../util/TimeUtil';
import NPModule from './NPModule';
import NPFolder from './NPFolder';
import Recurrence from './Recurrence';
import Reminder from './Reminder';

export default class NPEvent extends NPEntry {
  recurId = 1;

  // JS date objects
  startDateObj = null;
  endDateObj = null;

  // strings for local date/time
  // they are defined in JSON API.
  localStartDate;
  localStartTime;
  localEndDate;
  localEndTime;

  timezone;
  timezoneOffset;

  recurring;
  recurrence;
  eventReminders;

  constructor (data) {
    super(data);

    if (data) {
      this.localStartDate = data['localStartDate'];
      this.localStartTime = data['localStartTime'];
      this.localEndDate = data['localEndDate'];
      this.localEndTime = data['localEndTime'];
      this.timezoneOffset = data['timezoneOffset'];
      this.timezone = data['timezone'];

      // ISO-8601 form
      let startDateTimeStr = this.localStartDate;
      if (this.localStartTime) {
        startDateTimeStr += 'T' + this.localStartTime + this.timezoneOffset;
      }

      // -- build the start date(time) object
      this.startDateObj = TimeUtil.toDateObj(startDateTimeStr);

      // -- build the end date(time) object
      if (this.localEndDate) {
        let endDateTimeStr = this.localEndDate;
        if (this.localEndTime) {
          endDateTimeStr += 'T' + this.localEndTime + this.timezoneOffset;
        }
        this.endDateObj = TimeUtil.toDateObj(endDateTimeStr);
      } else if (this.localEndTime) {
        // There is no end data, but there is end time
        let endDateTimeStr = this.localStartDate + 'T' + this.localEndTime;
        endDateTimeStr += this.timezoneOffset;
        this.endDateObj = TimeUtil.toDateObj(endDateTimeStr);
      }

      this.recurring = data['recurring'];
    }

    if (data && data['recurrence']) {
      this.recurrence = new Recurrence(data['recurrence']);
      this.recurId = parseInt(data.recurId);
    } else {
      this.recurrence = new Recurrence();
      this.recurId = 1;
    }

    if (data && data['eventReminders']) {
      this.eventReminders = [];
      for (let i in data['eventReminders']) {
        this.eventReminders.push(new Reminder(data['eventReminders'][i]));
      }
    } else {
      this.eventReminders = [];
    }

    if (!this.folder) {
      this.folder = NPFolder.of(NPModule.CALENDAR, NPFolder.ROOT);
    }

    this.setModuleId(NPModule.CALENDAR);
  }

  copy (otherEvent) {
    super.copy(otherEvent);
  }

  static of (folder, startDateStr, startTimeStr, endDateStr, endTimeStr) {
    let event = NPEvent.blankInstance(folder);
    event.folder = folder;
    event.owner = folder.owner;
    event.localStartDate = startDateStr;
    event.localStartTime = startTimeStr;
    event.localEndDate = endDateStr;
    event.localEndTime = endTimeStr;
    return event;
  }

  static blankInstance (folder, entryId, recurId) {
    let obj = new NPEvent();
    obj.folder = folder;
    obj.owner = folder.owner;

    if (entryId) {
      obj.entryId = entryId;
      if (recurId) {
        obj.recurId = recurId;
      }
    } else {
      obj.entryId = '';
    }

    // obj.addReminder(new Reminder());
    return obj;
  }

  getKeyId () {
    return this.entryId + this.recurId;
  }

  keyMatches (otherEntry) {
    return this.entryId === otherEntry.entryId && this.recurId === otherEntry.recurId;
  }

  hasTime () {
    if (this.localStartTime || this.localEndTime) {
      return true;
    }
    return false;
  }

  setTime (startDateObj, endDateObj) {
    if (this.allDay || this.noStartingTime) {
      if (startDateObj) {
        this.localStartDate = TimeUtil.npLocalDate(startDateObj);
      }
      if (endDateObj) {
        this.localEndDate = TimeUtil.npLocalDate(endDateObj);
      }
    } else {
      if (startDateObj) {
        this.localStartDate = TimeUtil.npLocalDate(startDateObj);
        this.localStartTime = TimeUtil.npLocalTime(startDateObj);
      }
      if (endDateObj) {
        this.localEndDate = TimeUtil.npLocalDate(endDateObj);
        this.localEndTime = TimeUtil.npLocalTime(endDateObj);
      }
    }
  }

  setRecurrence (pattern, interval, recurringTimes, lastRecurrenceDate, monthlyRepeatType) {
    let recurrence = {
      'pattern': pattern,
      'interval': interval,
      'recurrenceTimes': recurringTimes,
      'endDate': lastRecurrenceDate,
      'repeatForever': false,
      'monthlyRepeatType': monthlyRepeatType
    };

    if (lastRecurrenceDate === null) {
      recurrence.repeatForever = true;
    }
  }

  getRecurrence () {
    if (this.recurrence && this.recurrence.pattern !== Recurrence.NOREPEAT) {
      return this.recurrence;
    }
    return null;
  }

  hasReminder () {
    return this.eventReminders && this.eventReminders.length > 0;
  }

  getReminder () {
    if (this.eventReminders && this.eventReminders.length > 0) {
      return this.eventReminders[0];
    }
  }

  addReminder (reminder) {
    this.eventReminders.push(reminder);
  }

  clearReminder () {
    if (this.eventReminders) {
      while (this.eventReminders.length > 0) {
        this.eventReminders.pop();
      }
    }
  }

  toJson () {
    let data = super.toJson();

    data['recurId'] = this.recurId;
    data['localStartDate'] = this.localStartDate;
    data['localStartTime'] = this.localStartTime;
    data['localEndDate'] = this.localEndDate;
    data['localEndTime'] = this.localEndTime;
    data['timezone'] = this.timezone;

    if (this.recurrence) {
      data['recurrence'] = this.recurrence.toJson();
    }

    if (this.eventReminders.length > 0) {
      data['eventReminders'] = [];
      for (let reminder of this.eventReminders) {
        data['eventReminders'].push(reminder.toJson());
      }  
    }

    return data;
  }
}
