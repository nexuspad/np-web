import EntryService from '../service/EntryService';
import TimeUtil from '../util/TimeUtil';
import NPModule from './NPModule';
import ListSetting from './ListSetting';
import NPEntry from './NPEntry';
import NPFolder from './NPFolder';

export default class EntryList {
  folder = null;
  listSetting = null;
  entries = [];

  expiration;

  constructor (data) {
    if (data) {
      if (data.listSetting) {
        this.listSetting = new ListSetting(data.listSetting);
      }

      if (data.entries) {
        data.entries.forEach(e => {
          this.entries.push(EntryService.initEntryObj(e));
        });
      }

      if (data.folder) {
        this.folder = new NPFolder(data.folder);
      }

      this.moduleId = data.moduleId;
      this.set30MinutesExpiration();
    } else {
      this.listSetting = new ListSetting();
    }
  }

  truncate () {
    while (this.entries.length) {
      this.entries.pop();
    }
  }

  static makeCopy (from, to) {
    if (to.entries) {
      while (to.entries.length) {
        to.entries.pop();
      }
      to.entries.push(...from.entries);
    }
  }

  isForModule () {
    if (this.listSetting) {
      return this.listSetting.moduleId;
    }
    return NPModule.NOT_ASSIGNED;
  }

  getFolderId () {
    if (this.listSetting) {
      return this.listSetting.folderId;
    }
    return -1;
  }

  isPaginated () {
    return this.listSetting.countPerPage !== 0;
  }

  set30MinutesExpiration () {
    this.expiration = TimeUtil.addMinutes(new Date(), 29);
  }

  isExpired () {
    let now = new Date();
    if (this.expiration == null || this.expiration.getSeconds() < now.getSeconds()) {
      return true;
    }
    return false;
  }

  isEmpty () {
    if (!this.entries || this.entries.length === 0) return true;
    return false;
  }

  /**
   * returns -1 if an entry is not found.
   */
  hasEntry (entryObj) {
    if (this.entries) {
      return this.entries.findIndex(function (element) {
        return element.keyMatches(entryObj);
      });
    }
  }

  addEntry (entryObj) {
    if (this.hasEntry(entryObj) === -1) {
      this.entries.push(entryObj);
    }
  }

  getEntry (entryId) {
    if (!this.entries) {
      return null;
    }

    var len = this.entries.length;
    for (var i = 0; i < len; i++) {
      if (this.entries[i].entryId === entryId) {
        return this.entries[i];
      }
    }
    return null;
  }

  hasEntriesInPage (pageId) {
    if (!this.listSetting.pages || this.listSetting.pages.length === 0) {
      return false;
    }
    return this.listSetting.pages.indexOf(pageId) !== -1;
  }

  getEntriesInPage (pageId) {
    if (this.isPaginated()) {
      if (this.listSetting.pages && this.listSetting.pages.indexOf(pageId) !== -1) {
        let pageMap = {};
        let chunk = 0;
        this.listSetting.pages.forEach(p => {
          pageMap[p] = this.entries.slice(this.listSetting.countPerPage * chunk, this.listSetting.countPerPage * (chunk + 1));
          chunk++;
        });
        return pageMap[pageId];
      } else {
        return [];
      }
    } else {
      return this.entries;
    }
  }

  previousEntry (entryId) {
    if (!this.entries) {
      return {};
    }

    var len = this.entries.length;
    for (var i = 0; i < len; i++) {
      if (this.entries[i].entryId === entryId) {
        if (i >= 1) {
          return this.entries[i - 1];
        }
      }
    }

    // return the last one
    return this.entries[len - 1];
  }

  nextEntry (entryId) {
    if (!this.entries) {
      return {};
    }

    var len = this.entries.length;
    for (var i = 0; i < len; i++) {
      if (this.entries[i].entryId === entryId) {
        if (i < len - 1) {
          return this.entries[i + 1];
        }
      }
    }

    // return the first one
    return this.entries[0];
  }

  // should only be used by *Service classes.
  updateEntries (entries) {
    entries.map(entry => {
      this._updateOrAddEntry(entry);
    });
    EntryList.sortEntriesByUpdateTime(this.entries);
  }

  deleteEntry (entry) {
    if (!this.entries || !this.listSetting) {
      return {};
    }

    // delete from this.entries
    // need to iterate through the whole array since there multiple events (recurrence) may need to be deleted
    // use while (i--) so splice works
    let i = this.entries.length;
    while (i--) {
      if (this.entries[i].keyMatches(entry)) {
        this.entries.splice(i, 1);
        if (this.listSetting.total_count > 0) {
          this.listSetting.total_count--;
        }
      }
    }
  }

  deleteEntries (entries) {
    entries.map(entry => {
      this.deleteEntry(entry);
    });
  }

  /*
   * update the entries array, pages array and total count.
   */
  mergeList (anotherList) {
    if (this.listSetting.isTimeline() && anotherList.listSetting.isTimeline()) {
      if (Date.parse(anotherList.listSetting.startDate) <= Date.parse(this.listSetting.startDate) &&
          Date.parse(anotherList.listSetting.endDate) >= Date.parse(this.listSetting.endDate)
      ) {
        this.listSetting.startDate = anotherList.listSetting.startDate;
        this.listSetting.endDate = anotherList.listSetting.endDate;
        // merge the entries
        let entryIds = this.entries.map(x => x.entryId);
        let entries = anotherList.entries.filter(x => entryIds.indexOf(x.entryId) === -1);
        this.entries.push(...entries);
        this.listSetting.totalCount = anotherList.listSetting.totalCount;
        return true;
      } else {
        return false;
      }
    } else if (anotherList.listSetting.pages && anotherList.listSetting.pages.length > 0) {
      // merge the pages
      anotherList.listSetting.pages.forEach(
        p => {
          if (this.listSetting.pages.indexOf(p) === -1) {
            this.listSetting.pages.push(p);
          }
        }
      )
      this.listSetting.pages.sort(
        (a, b) => { return a - b; }
      )
      // merge and sort the entries
      let entryIds = this.entries.map(x => x.entryId);
      let entries = anotherList.entries.filter(x => entryIds.indexOf(x.entryId) === -1);
      this.entries.push(...entries);
      this.listSetting.totalCount = anotherList.listSetting.totalCount;
      this.sortEntries();

      return true;
    }

    return false;
  }

  sortEntries () {
    if (!this.listSetting.sortBy) {
      EntryList.sortEntriesByUpdateTime(this.entries);
    }
    EntryList.sortEntriesByUpdateTime(this.entries);
  }

  // private
  _updateOrAddEntry (entry) {
    if (!this.entries || !this.listSetting) {
      return {};
    }

    // when an entry is moved from one folder to another, delete it from the list, UNLESS, it's pinned.
    if (entry.pinned && this.listSetting.folderId === 0) {
      // proceed
    } else if (this.listSetting.folderId === 0 && this.listSetting.includeEntriesInAllFolders) {
      // proceed
    } else {
      // do not proceed
      if (entry.folder.folderId !== this.listSetting.folderId) {
        this.deleteEntry(entry);
        return;
      }
    }

    let self = this;
    let updated = false;
    this.entries.forEach(function (elem, index, theArray) {
      if (entry.moduleId === self.listSetting.moduleId && entry.keyMatches(elem)) {
        if (theArray[index].status === NPEntry.DELETED && entry.status !== NPEntry.DELETED) {
          // an entry is restored. it needs to be removed from the list
          console.debug('Entry in the list deleted: ', entry.moduleId, self.listSetting.folderId, entry.getKeyId());
          self.deleteEntry(entry);
        } else {
          console.debug('Entry in the list updated: ', entry.moduleId, self.listSetting.folderId, entry.getKeyId());
          theArray[index] = Object.assign(theArray[index], entry);
        }
        updated = true;
      }
    });

    if (!updated) {
      // add the new entry to the front
      console.log('Add the entry to the list', this.listSetting.folderId, entry.entryId);
      this.entries.unshift(entry);
    }
  }

  /**
   * Sort the entries by timeline. Two new references are created:
   *
   * 1. dateKeys - sorted
   * 2. dateEntries mapping
   */
  static sortEntriesByTimeline (moduleId, entries) {
    var len = entries.length;

    let dateKeys = [];
    let dateEntriesMap = {};

    for (var i = 0; i < len; i++) {
      var entry = entries[i];

      var dateKey = TimeUtil.timestampToNPDateStr(entry.updateTime);

      if (dateKey) {
        // Assign the entry's attribute because it will be used when opening the photo lightbox (photo_card.htm)
        entry.dateKey = dateKey;

        if (!dateEntriesMap[dateKey]) {
          dateEntriesMap[dateKey] = [];
        }
        dateEntriesMap[dateKey].push(entry);

        if (dateKeys.indexOf(dateKey) === -1) {
          dateKeys.push(dateKey);
        }
      }
    }

    // Sort the date keys in ASC
    dateKeys.sort(function (a, b) {
      return b - a
    });

    // Sort the entries for each date key by modified time
    for (dateKey in dateEntriesMap) {
      dateEntriesMap[dateKey].sort(function (a, b) {
        var x = a['modified_ts'];
        var y = b['modified_ts'];
        return ((x < y) ? 1 : ((x > y) ? -1 : 0));
      });
    }

    // For Doc module, rebuild the entries array so Doc navigator works.
    // No need for the other modules, especially for Calendar.
    if (moduleId === 4) {
      entries.length = 0;
      for (dateKey in dateEntriesMap) {
        entries = entries.concat(dateEntriesMap[dateKey]);
      }
    }
  }

  static sortEntriesByUpdateTime (entries) {
    if (!entries) {
      return {};
    }

    entries.sort(function (a, b) {
      if (a.pinned && !b.pinned) {
        return -1;
      }

      if (!a.pinned && b.pinned) {
        return 1;
      }

      var x = a.updateTime;
      var y = b.updateTime;
      return ((x < y) ? 1 : ((x > y) ? -1 : 0));
    });

    return entries;
  }

  static sortEntriesBySortKey (entries) {
    if (!entries) {
      return {};
    }

    entries.sort(function (a, b) {
      return ((a.sortKey < b.sortKey) ? -1 : ((a.sortKey > b.sortKey) ? 1 : 0));
    });

    return entries;
  }
}
