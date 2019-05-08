import BaseService from './BaseService'
import AccountService from './AccountService'
import PromiseManager from '../util/PromiseManager'
import CommonUtils from '../util/CommonUtils';
import RestClient from '../util/RestClient'
import ErrorHandler from '../util/ErrorHandler'
import EntryServiceData from './EntryServiceData';
import NPModule from '../datamodel/NPModule';
import NPError from '../datamodel/NPError'
import NPEvent from '../datamodel/NPEvent';
import NPContact from '../datamodel/NPContact';
import NPDoc from '../datamodel/NPDoc';
import NPBookmark from '../datamodel/NPBookmark';
import NPPhoto from '../datamodel/NPPhoto';
import NPUpload from '../datamodel/NPUpload';
import EntryList from '../datamodel/EntryList';
import ListServiceFactory from './ListServiceFactory';

export default class EntryService extends BaseService {
  static initEntryObj (data) {
    switch (data.moduleId) {
      case NPModule.BOOKMARK:
        return new NPBookmark(data);
      case NPModule.CONTACT:
        return new NPContact(data);
      case NPModule.CALENDAR:
        return new NPEvent(data);
      case NPModule.DOC:
        return new NPDoc(data);
      case NPModule.PHOTO:
        return new NPPhoto(data);
      case NPModule.UPLOAD:
        return new NPUpload(data);
    }

    throw new NPError('Invalid entry data object.');
  }

  static initEntryListObj (entryListData) {
    switch (entryListData.listSetting.moduleId) {
      case NPModule.BOOKMARK:
        return new EntryList(entryListData);
      case NPModule.CONTACT:
        return new EntryList(entryListData);
      case NPModule.CALENDAR:
        return new EntryList(entryListData);
      case NPModule.DOC:
        return new EntryList(entryListData);
      case NPModule.PHOTO:
        return new EntryList(entryListData);
    }
  }

  static get (entry, refresh = false) {
    let uri = this.getEntryEndPoint(entry);
    return this._getInternal(entry, uri, refresh);
  }

  static _getInternal (entry, uri, refresh = false) {
    let listService = null;

    if (entry.folder && entry.owner) {
      listService = ListServiceFactory.locate({
        moduleId: entry.moduleId,
        folderId: entry.folder.folderId,
        ownerId: entry.owner.userId
      }, false);
    }

    if (refresh === false && listService) {
      let entryInList = listService.findEntryInList(entry);
      if (entryInList) {
        let p = new Promise((resolve) => {
          resolve(entryInList);
        });
        return p;
      }
    }

    let p = PromiseManager.get(uri);

    if (p) {
      return p;
    } else {
      p = new Promise((resolve, reject) => {
        RestClient.instance(AccountService.currentSession(), this.getHeaders({entry: entry})).get(uri)
          .then(function (response) {
            // Parse application level response data
            if (response.data.errorCode) {
              reject(new NPError(response.data.errorCode));
            } else {
              let entryObj = EntryService.initEntryObj(response.data.entry);
              if (listService) {
                listService.updateEntriesInList(entry.moduleId, Array(1).fill(entryObj));
              }
              resolve(entryObj);
            }
          })
          .catch(function (error) {
            let rc = ErrorHandler.handleError(error);
            reject(new NPError(rc));
          });
      });

      PromiseManager.set(p, uri);
      return p;
    }
  }

  static save (entry) {
    let uri = this.getEntryEndPoint(entry);
    return this._saveInternal(uri, entry);
  }

  static _saveInternal (uri, entry) {
    let p = PromiseManager.get(uri, 'POST');

    if (p) {
      return p;
    } else {
      let listServiceArr = ListServiceFactory.locateAll(entry.moduleId, entry.owner.userId);

      p = new Promise((resolve, reject) => {
        RestClient.instance(AccountService.currentSession(), this.getHeaders({entry: entry}))
        .post(uri, EntryServiceData.of(entry).convertToJsonForPosting())
          .then(function (response) {
            // Parse application level response data
            if (response.data.errorCode) {
              reject(new NPError(response.data.errorCode));
            } else {
              if (response.data.entry) {
                let entryObj = EntryService.initEntryObj(response.data.entry);
                listServiceArr.forEach(service => {
                  service.updateEntriesInList(entry.moduleId, Array(1).fill(entryObj));
                });
                resolve(entryObj);
              } else if (response.data.entryList) {
                let entryList = EntryService.initEntryListObj(response.data.entryList);
                listServiceArr.forEach(service => {
                  service.updateEntriesInList(entry.moduleId, entryList.entries);
                });
                resolve(entryList);
              } else {
                reject(new NPError('Invalid data response for saving entry.'));
              }
            }
          })
          .catch(function (error) {
            console.log(error);
            let rc = ErrorHandler.handleError(error);
            reject(new NPError(rc));
          });
      });

      PromiseManager.set(p, uri, 'POST');
      return p;
    }
  }

  static updateTitle (entry) {
    return EntryService._updateAttribute(entry, 'title');
  }

  static updatePin (entry) {
    return EntryService._updateAttribute(entry, 'pin');
  }

  static updateTag (entry) {
    return EntryService._updateAttribute(entry, 'tag');
  }

  static updateFolder (entry) {
    return EntryService._updateAttribute(entry, 'folder');
  }

  static updateWeight (entry) {
    return EntryService._updateAttribute(entry, 'weight');
  }

  static restore (entry) {
    return EntryService._updateAttribute(entry, 'status');
  }

  /**
   * @param {*} entry
   * @param {*} attribute: pin/tag/folder/status/title
   */
  static _updateAttribute (entry, attribute) {
    let uri = this.getEntryEndPoint(entry) + '/' + attribute;

    let p = PromiseManager.get(uri, 'POST');

    if (p) {
      return p;
    } else {
      let listServiceArr = ListServiceFactory.locateAll(entry.moduleId, entry.owner.userId);
      p = new Promise((resolve, reject) => {
        RestClient.instance(AccountService.currentSession(), this.getHeaders({entry: entry}))
        .post(uri, EntryServiceData.of(entry).convertToJsonForPosting())
          .then(function (response) {
            // Parse application level response data
            if (response.data.errorCode) {
              reject(Error(response.data.errorCode));
            } else {
              if (response.data.entry) {
                let entryObj = EntryService.initEntryObj(response.data.entry);
                listServiceArr.forEach(service => {
                  service.updateEntriesInList(entry.moduleId, Array(1).fill(entryObj));
                });
                resolve(entryObj);
              } else if (response.data.entryList) {
                let entryList = EntryService.initEntryListObj(response.data.entryList);
                listServiceArr.forEach(service => {
                  service.updateEntriesInList(entry.moduleId, entryList.entries);
                });
                resolve(entryList);
              } else {
                reject(new NPError('Invalid data response for saving entry.'));
              }
            }
          })
          .catch(function (error) {
            console.log(error);
            let rc = ErrorHandler.handleError(error);
            reject(new NPError(rc));
          });
      });

      PromiseManager.set(p, uri, 'POST');
      return p;
    }
  }

  static delete (entry) {
    let uri = this.getEntryEndPoint(entry);
    return this._deleteInternal(uri, entry);
  }

  static _deleteInternal(uri, entry) {
    let p = PromiseManager.get(uri, 'DELETE');

    if (p) {
      return p;
    } else {
      let listServiceArr = ListServiceFactory.locateAll(entry.moduleId, entry.owner.userId);

      p = new Promise((resolve, reject) => {
        RestClient.instance(AccountService.currentSession(), this.getHeaders({entry: entry})).delete(uri)
          .then(function (response) {
            // Parse application level response data
            if (response.data.errorCode) {
              reject(new NPError(response.data.errorCode));
            } else {
              if (response.data.entry) {
                let entryObj = EntryService.initEntryObj(response.data.entry);
                listServiceArr.forEach(service => {
                  service.deleteEntriesInList(entry.moduleId, Array(1).fill(entryObj));
                });
                resolve(entryObj);
              } else if (response.data.entryList) {
                let entryList = EntryService.initEntryListObj(response.data.entryList);
                listServiceArr.forEach(service => {
                  service.deleteEntriesInList(entry.moduleId, entryList.entries);
                });
                resolve(entryList);
              } else {
                reject(new NPError('Invalid data response for deleting entry.'));
              }
            }
          })
          .catch(function (error) {
            ErrorHandler.handleError(error);
            reject(new NPError('error'));
          });
      });

      PromiseManager.set(p, uri, 'DELETE');
      return p;
    }
  }

  static deleteAttachment (uploadEntryId, parentEntry) {
    let uri = this.getDeleteAttachmentEndpoint(uploadEntryId, parentEntry.moduleId);

    let p = PromiseManager.get(uri, 'DELETE');

    if (p) {
      return p;
    } else {
      let listServiceArr = ListServiceFactory.locateAll(parentEntry.moduleId, parentEntry.owner.userId);

      p = new Promise((resolve, reject) => {
        RestClient.instance(AccountService.currentSession(), this.getHeaders({entry: parentEntry})).delete(uri)
          .then(function (response) {
            // Parse application level response data
            if (response.data.errorCode) {
              reject(new NPError(response.data.errorCode));
            } else {
              if (response.data.entry) {
                let entryObj = EntryService.initEntryObj(response.data.entry);
                listServiceArr.forEach(service => {
                  service.updateEntriesInList(entryObj.moduleId, Array(1).fill(entryObj));
                });
                resolve(entryObj);
              } else {
                reject(new NPError('Invalid data response for deleting entry attachment.'));
              }
            }
          })
          .catch(function (error) {
            ErrorHandler.handleError(error);
            reject(new NPError('error'));
          });
      });

      PromiseManager.set(p, uri, 'DELETE');
      return p;
    }
  }

  static bulkDelete (folder, entryIdsArr) {
    if (!entryIdsArr || entryIdsArr.length === 0) {
      return;
    }
    let uri = this.getBulkActionEndPoint(folder.moduleId, entryIdsArr.join());

    let p = PromiseManager.get(uri, 'BULKDELETE');

    if (p) {
      return p;
    } else {
      let listServiceArr = ListServiceFactory.locateAll(folder.moduleId, folder.owner.userId);

      p = new Promise((resolve, reject) => {
        RestClient.instance(AccountService.currentSession(), this.getHeaders({folder: folder})).delete(uri)
          .then(function (response) {
            // Parse application level response data
            if (response.data.errorCode) {
              reject(NPError(response.data.errorCode));
            } else {
              if (response.data.entry) {
                let entryObj = EntryService.initEntryObj(response.data.entry);
                listServiceArr.forEach(service => {
                  service.deleteEntriesInList(folder.moduleId, Array(1).fill(entryObj));
                });
                resolve(entryObj);
              } else if (response.data.entryList) {
                let entryList = EntryService.initEntryListObj(response.data.entryList);
                listServiceArr.forEach(service => {
                  service.deleteEntriesInList(folder.moduleId, entryList.entries);
                });
                resolve(entryList);
              } else {
                reject(new NPError('Invalid data response for deleting entry.'));
              }
            }
          })
          .catch(function (error) {
            ErrorHandler.handleError(error);
            reject(new NPError('error'));
          });
      });

      PromiseManager.set(p, uri, 'DELETE');
      return p;
    }
  }

  static bulkMove (entryIdsArr, fromFolder, toFolder) {
    if (!entryIdsArr || entryIdsArr.length === 0) {
      return;
    }
    let uri = this.getBulkActionEndPoint(toFolder.moduleId, this.MOVE.toLowerCase());

    let p = PromiseManager.get(uri, 'BULKMOVE');

    if (p) {
      return p;
    } else {
      let serviceData = EntryServiceData.ofMultipleUpdates(entryIdsArr, this.MOVE, toFolder);

      let listServiceFrom = ListServiceFactory.locate({
        moduleId: fromFolder.moduleId,
        folderId: fromFolder.folderId,
        ownerId: fromFolder.getOwnerId()
      });

      let listServiceTo = ListServiceFactory.locate({
        moduleId: toFolder.moduleId,
        folderId: toFolder.folderId,
        ownerId: toFolder.getOwnerId()
      });

      p = new Promise((resolve, reject) => {
        RestClient.instance(AccountService.currentSession(), this.getHeaders({folder: toFolder})).post(uri, serviceData)
          .then(function (response) {
            // Parse application level response data
            if (response.data.errorCode) {
              reject(NPError(response.data.errorCode));
            } else {
              if (response.data.entry) {
                let entryObj = EntryService.initEntryObj(response.data.entry);
                listServiceFrom.deleteEntriesInList(fromFolder.moduleId, Array(1).fill(entryObj));
                listServiceTo.updateEntriesInList(toFolder.moduleId, Array(1).fill(entryObj));
                resolve(entryObj);
              } else if (response.data.entryList) {
                let entryList = EntryService.initEntryListObj(response.data.entryList);
                listServiceFrom.deleteEntriesInList(fromFolder.moduleId, entryList.entries);
                listServiceTo.updateEntriesInList(toFolder.moduleId, entryList.entries);
                resolve(entryList);
              } else {
                reject(new NPError('Invalid data response for deleting entry.'));
              }
            }
          })
          .catch(function (error) {
            ErrorHandler.handleError(error);
            reject(new NPError('error'));
          });
      });

      PromiseManager.set(p, uri, 'BULKMOVE');
      return p;
    }
  }

  static exportModule (moduleId) {
    let uri = this.getBulkActionEndPoint(moduleId, 'export');

    let p = PromiseManager.get(uri, 'EXPORT_' + moduleId);

    if (p) {
      return p;
    } else {
      p = new Promise((resolve, reject) => {
        RestClient.instance(AccountService.currentSession(), this.getHeaders({})).post(uri)
          .then(function (response) {
            // Parse application level response data
            if (response.data.errorCode) {
              reject(NPError(response.data.errorCode));
            } else {
              resolve();
            }
          })
          .catch(function (error) {
            ErrorHandler.handleError(error);
            reject(new NPError('error'));
          });
      });

      PromiseManager.set(p, uri, 'EXPORT_' + moduleId);
      return p;
    }
  }

  static emptyTrash (moduleId) {
    let uri = this.getEmptyTrashEndPoint(moduleId);

    let p = PromiseManager.get(uri, 'EMPTY_TRASH');

    if (p) {
      return p;
    } else {
      p = new Promise((resolve, reject) => {
        RestClient.instance(AccountService.currentSession()).delete(uri)
          .then(function (response) {
            // Parse application level response data
            if (response.data.errorCode) {
              reject(new NPError(response.data.errorCode));
            } else {
              resolve(response);
            }
          })
          .catch(function (error) {
            ErrorHandler.handleError(error);
            reject(new NPError('error'));
          });
      });

      PromiseManager.set(p, uri, 'EMPTY_TRASH');
      return p;
    }
  }
}
