import EntryService from './EntryService'
import TimeUtil from '../util/TimeUtil';

export default class EventService extends EntryService {
  static UPDATE_ALL = 0;
  static UPDATE_ONE = 1;
  static UPDATE_FUTURE = 2;

  static get (event, refresh = false) {
    let uri = this.getEntryEndPoint(event);
    if (event.recurId) {
      uri = uri + '/' + event.recurId;
    }
    return this._getInternal(event, uri, refresh);
  }

  static updateStartTime (event, newStart) {
    let duration = TimeUtil.findDurationInSeconds(event.startDateObj, event.endDateObj);
    event.startDateObj = newStart;
    event.endDateObj = TimeUtil.addSeconds(newStart, duration);

    EventService.save(event);
  }

  static updateDuration (event, newDuration) {
    EventService.save(event);
  }

  static save (event, updateOption) {
    let uri = this.getEntryEndPoint(event);
    
    if (updateOption == this.UPDATE_ONE) {
      uri = uri + '/' + event.recurId;
    } else if (updateOption == this.UPDATE_FUTURE) {
      uri = uri + '/' + event.recurId + '_';
    }

    return this._saveInternal(uri, event);
  }

  static delete (event, updateOption) {
    let uri = this.getEntryEndPoint(event);
    
    if (updateOption == this.UPDATE_ONE) {
      uri = uri + '/' + event.recurId;
    } else if (updateOption == this.UPDATE_FUTURE) {
      uri = uri + '/' + event.recurId + '_';
    }

    return this._deleteInternal(uri, event);
  }
}
