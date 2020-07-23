import EntryList from '../datamodel/EntryList';
import SearchItem from '../datamodel/SearchItem';
import NPModule from '../datamodel/NPModule';
import NPError from '../datamodel/NPError'
import BaseService from './BaseService';
import AccountService from './AccountService';
import PromiseManager from '../util/PromiseManager';
import RestClient from '../util/RestClient';
import ErrorHandler from '../util/ErrorHandler'
import PreferenceService from './PreferenceService';
import EventList from '../datamodel/EventList';

export default class ListService extends BaseService {
  moduleId;
  folderId;
  dateRange = [];
  ownerId;

  entryList = null;

  constructor ({ moduleId, folderId }) {
    super();
    this.moduleId = moduleId;
    this.folderId = folderId;
  }

  /**
   * This only gets the current list for the module.
   * It can be a folder list, search result, or timeline list.
   * @param {*} moduleId
   */
  _getCurrentEntryList (moduleId) {
    if (this.entryList !== null && moduleId === this.entryList.listSetting.moduleId) {
      return this.entryList;
    } else {
      return null;
    }
  }

  getList (listQuery, refresh = false) {
    if (listQuery.keyword) {
      return this._search({ moduleId: listQuery.moduleId, keyword: listQuery.keyword, ownerId: listQuery.ownerId });
    } else {
      return this.getEntries(listQuery, refresh);
    }
  }

  /**
   * Retrieve a list based on the list settings.
   */
  getEntries (listQuery, refresh = false) {
    if (refresh === false && this.entryList && !this.entryList.isExpired()) {
      if (this.entryList.listSetting.isSuperSetOf(listQuery)) {
        console.log('Use the existing list for ', this.entryList.expiration, listQuery);
        let p = new Promise((resolve) => {
          resolve(this.entryList);
        });
        return p;
      }
    } else {
      this.clear();
    }

    if (listQuery.includeEntriesInAllFolders) {
      var uri = BaseService.getListEndPoint(listQuery.moduleId, 'all', listQuery.pageId);
    } else {
      uri = BaseService.getListEndPoint(listQuery.moduleId, listQuery.folderId, listQuery.pageId);
    }

    let p = PromiseManager.get(uri);

    if (p && refresh === false) {
      return p;
    } else {
      let self = this;
      p = new Promise((resolve, reject) => {
        RestClient.instance(AccountService.currentSession(), BaseService.getHeaders({listQuery: listQuery}))
        .get(uri)
          .then(function (response) {
            if (response.data.errorCode) {
              reject(Error(response.data.errorCode));
            } else {
              let theList = ListService.initListObj(response.data.entryList);
              if (self.entryList && self.entryList.listSetting.moduleId === theList.listSetting.moduleId &&
                self.entryList.listSetting.folderId === theList.listSetting.folderId
              ) {
                if (self.entryList.mergeList(theList)) {
                  console.log('merged the list....', self.entryList.listSetting);
                } else {
                  self.entryList = theList;
                }
              } else {
                self.entryList = theList;
              }
              resolve(self.entryList);
            }
          })
          .catch(function (error) {
            let rc = ErrorHandler.handleError(error);
            reject(Error(rc));
          });
      });

      PromiseManager.set(p, uri);
      return p;
    }
  }

  getEntriesInDateRange (listQuery, refresh = false) {
    if (refresh === false && this.entryList && !this.entryList.isExpired()) {
      if (this.entryList.listSetting.isSuperSetOf(listQuery)) {
        console.log('Use the existing list for ', this.entryList.listSetting);
        let p = new Promise((resolve) => {
          resolve(this.entryList);
        });
        return p;
      }
    }

    if (listQuery.includeEntriesInAllFolders) {
      var uri = BaseService.getTimelineEndPoint(listQuery.moduleId, 'all', listQuery.startDate, listQuery.endDate);
    } else {
      uri = BaseService.getTimelineEndPoint(listQuery.moduleId, listQuery.folderId, listQuery.startDate, listQuery.endDate);
    }

    let p = PromiseManager.get(uri);

    if (p) {
      return p;
    } else {
      let self = this;

      let activeTimezone = PreferenceService.getActiveTimezone();

      p = new Promise((resolve, reject) => {
        RestClient.instance(AccountService.currentSession(), BaseService.getHeaders({listQuery: listQuery, timezone: activeTimezone}))
        .get(uri)
          .then(function (response) {
            if (response.data.errorCode) {
              reject(Error(response.data.errorCode));
            } else {
              let theList = ListService.initListObj(response.data.entryList);
              if (self.entryList && self.entryList.listSetting.moduleId === theList.listSetting.moduleId &&
                self.entryList.listSetting.folderId === theList.listSetting.folderId) {
                if (!self.entryList.mergeList(theList)) {
                  self.entryList = theList;
                } else {
                  console.debug('added a new page....');
                }
              } else {
                self.entryList = theList;
              }
              resolve(self.entryList);
            }
          })
          .catch(function (error) {
            let rc = ErrorHandler.handleError(error);
            reject(Error(rc));
          });
      });

      PromiseManager.set(p, uri);
      return p;
    }
  }

  _search ({ moduleId, ownerId = 0, keyword }) {
    let uri = BaseService.getSearchEndPoint(moduleId, 0, keyword);

    let headers = {
      'otoken': ownerId,
      'timezone': PreferenceService.getActiveTimezone()
    };
    
    // need to add the owner Id to the URL to differentiate the requests 
    let p = PromiseManager.get(uri + '_' + ownerId);

    if (p) {
      return p;
    } else {
      p = new Promise((resolve, reject) => {
        RestClient.instance(AccountService.currentSession(), headers).get(uri)
          .then(function (response) {
            if (response.data.errorCode) {
              reject(Error(response.data.errorCode));
            } else {
              let searchItems = [];
              if (response.data.searchResult) {
                response.data.searchResult.forEach(function (elem) {
                  searchItems.push(new SearchItem(elem));
                })
                resolve(searchItems);
              } else if (response.data.entryList) {
                let searchResultList = ListService.initListObj(response.data.entryList);
                resolve(searchResultList);
              }
            }
          })
          .catch(function (error) {
            let rc = ErrorHandler.handleError(error);
            reject(Error(rc));
          });
      });

      PromiseManager.set(p, uri);
      return p;
    }
  }

  getTrashed (moduleId) {
    let uri = BaseService.getTrashedEndpoint(moduleId);

    let p = PromiseManager.get(uri);

    if (p) {
      return p;
    } else {
      let self = this;
      p = new Promise((resolve, reject) => {
        RestClient.instance(AccountService.currentSession()).get(uri)
          .then(function (response) {
            if (response.data.errorCode) {
              reject(Error(response.data.errorCode));
            } else {
              self.entryList = ListService.initListObj(response.data.entryList);
              resolve(self.entryList);
            }
          })
          .catch(function (error) {
            let rc = ErrorHandler.handleError(error);
            reject(Error(rc));
          });
      });

      PromiseManager.set(p, uri);
      return p;
    }
  }

  clear () {
    this.entryList = null;
  }

  findEntryInList (entryObj) {
    let currentList = this._getCurrentEntryList(entryObj.moduleId);
    if (currentList !== null) {
      if (entryObj.moduleId === NPModule.EVENT) {
        return currentList.getEvent(entryObj.entryId, entryObj.recurId);
      }
      return currentList.getEntry(entryObj.entryId);
    }
    return null;
  }

  updateEntriesInList (moduleId, entries) {
    let currentList = this._getCurrentEntryList(moduleId);
    if (currentList !== null) {
      return currentList.updateEntries(entries);
    }
  }

  deleteEntriesInList (moduleId, entries) {
    let currentList = this._getCurrentEntryList(moduleId);
    if (currentList !== null) {
      console.debug('delete.....', entries);
      return currentList.deleteEntries(entries);
    }
  }

  static initListObj (data) {
    if (data.folder) {
      switch (data.folder.moduleId) {
        case NPModule.BOOKMARK:
        case NPModule.CONTACT:
        case NPModule.DOC:
        case NPModule.PHOTO:
        case NPModule.UPLOAD:
          return new EntryList(data);
        case NPModule.CALENDAR:
          return new EventList(data);
      }
    }

    throw new NPError('Invalid list data object.');
  }
}
