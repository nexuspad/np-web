import EntryList from './EntryList'

export default class EventList extends EntryList {
  refreshRecurringEvent (events) {
    // Remove the existing recurring events
    let len = this.entries.length;
    for (var i = len - 1; i >= 0; i--) {
      if (this.entries[i].entry_id === events[0].entry_id) {
        this.entries.splice(i, 1);
      }
    }

    for (i = 0; i < events.length; i++) {
      this.entries.push(events[i]);
    }
  }

  getEvent (entryId, recurId) {
    if (!this.entries) {
      return null;
    }

    var len = this.entries.length;
    for (var i = 0; i < len; i++) {
      if (this.entries[i].entryId === entryId && this.entries[i].recurId === recurId) {
        return this.entries[i];
      }
    }
    return null;
  }
}
