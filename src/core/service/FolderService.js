import NPError from '../datamodel/NPError'
import NPFolder from '../datamodel/NPFolder'
import BaseService from './BaseService'
import AccountService from './AccountService'
import PromiseManager from '../util/PromiseManager'
import RestClient from '../util/RestClient'
import ErrorHandler from '../util/ErrorHandler'
import FolderUtil from '../datamodel/FolderUtil';
import FolderServiceData from './FolderServiceData';
import AccessPermission from '../datamodel/AccessPermission';

export default class FolderService extends BaseService {
  static folders = null;

  static getAllFolders (moduleId, refresh = false) {
    let root = NPFolder.of(moduleId, NPFolder.ROOT, AccountService.currentUser(),
      AccessPermission.ofOwnerDefault(AccountService.currentUser().userId));

    if (refresh === false && FolderService.folders !== null) {
      if (FolderService.folders && FolderService.folders.length > 0 &&
          FolderService.folders[0].moduleId === moduleId) {
        let p = new Promise((resolve) => {
          let folderTree = FolderUtil.convertToTree(FolderUtil.folderArrayCopy(FolderService.folders), root);
          resolve(folderTree);
        });
        return p;
      }
    }

    let uri = BaseService.getSubFoldersEndPoint(NPFolder.of(moduleId, NPFolder.ROOT));

    let p = PromiseManager.get(uri);
    if (p) {
      return p;
    } else {
      p = new Promise((resolve, reject) => {
        RestClient.instance(AccountService.currentSession()).get(uri)
          .then(function (response) {
            // Parse application level response data
            if (response.data.errorCode) {
              reject(new NPError(response.data.errorCode));
            } else {
              if (response.data.folders) {
                FolderService.folders = response.data.folders.map(x => NPFolder.initWith(x));
                let folderTree = FolderUtil.convertToTree(FolderUtil.folderArrayCopy(FolderService.folders), root);
                resolve(folderTree);
              } else {
                reject(new NPError(NPError.EMPTY_DATA));
              }
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

  static get (folder) {
    let uri = BaseService.getFolderDetailEndPoint(folder);

    let p = PromiseManager.get(uri);
    if (p) {
      return p;
    } else {
      p = new Promise((resolve, reject) => {
        RestClient.instance(AccountService.currentSession(), BaseService.getHeaders({folder: folder})).get(uri)
          .then(function (response) {
            // Parse application level response data
            if (response.data.errorCode) {
              reject(new NPError(response.data.errorCode));
            } else {
              let folder = NPFolder.initWith(response.data.folder);
              resolve(folder);
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

  static save (folder, updateAction) {
    let uri = BaseService.getFolderDetailEndPoint(folder);

    if (updateAction === BaseService.UPDATE_SHARINGS) {
      uri = uri + '/sharing';
    }

    let p = PromiseManager.get(uri, 'POST');

    if (p) {
      return p;
    } else {
      p = new Promise((resolve, reject) => {
        RestClient.instance(AccountService.currentSession(), BaseService.getHeaders({folder: folder}))
        .post(uri, FolderServiceData.of(folder, updateAction).convertToJsonForPosting())
          .then(function (response) {
            // Parse application level response data
            if (response.data.errorCode) {
              reject(new NPError(response.data.errorCode));
            } else {
              let updatedFolder = NPFolder.initWith(response.data.folder);
              FolderService.saveLocally(updatedFolder);
              resolve(updatedFolder);
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

  static move (folder) {
    return FolderService.save(folder, BaseService.MOVE);
  }

  static updateSharing (folder, user, canRead, canWrite) {
    let accessPermissions = [];
    let access = new AccessPermission();
    access.setSharing(user, canRead, canWrite);
    accessPermissions.push(access);
    folder.sharing = accessPermissions;
    return FolderService.save(folder, BaseService.UPDATE_SHARINGS);
  }

  static refreshSharings (folder, sharing) {
    folder.sharing = sharing;
    return FolderService.save(folder, BaseService.UPDATE_SHARINGS);
  }

  static restore (folder) {
    return FolderService.save(folder, BaseService.RESTORE);
  }

  static delete (folder) {
    let uri = BaseService.getFolderDetailEndPoint(folder);

    let p = PromiseManager.get(uri, 'DELETE');

    if (p) {
      return p;
    } else {
      p = new Promise((resolve, reject) => {
        RestClient.instance(AccountService.currentSession(), BaseService.getHeaders({folder: folder}))
        .delete(uri)
          .then(function (response) {
            // Parse application level response data
            if (response.data.errorCode) {
              reject(new NPError(response.data.errorCode));
            } else {
              if (response.data.folder) {
                let deletedFolder = NPFolder.initWith(response.data.folder);
                FolderService.deleteLocally(deletedFolder);
                resolve(deletedFolder);
              } else {
                reject(new NPError(NPError.EMPTY_DATA));
              }
            }
          })
          .catch(function (error) {
            let rc = ErrorHandler.handleError(error);
            reject(new NPError(rc));
          });
      });

      PromiseManager.set(p, uri, 'DELETE');
      return p;
    }
  }

  static deleteLocally (folder) {
    if (FolderService.folders && FolderService.folders.length > 0 &&
        FolderService.folders[0].moduleId === folder.moduleId) {
      FolderService.folders.forEach(function (item, index, theArray) {
        if (item.folderId === folder.folderId) {
          theArray.splice(index, 1);
        }
      });
    }
  }

  static saveLocally (folder) {
    if (FolderService.folders && FolderService.folders.length > 0 && FolderService.folders[0].moduleId === folder.moduleId) {
      let folderUpdated = false;
      for (let i = 0; i < FolderService.folders.length; i++) {
        if (FolderService.folders[i].folderId === folder.folderId) {
          FolderService.folders[i] = Object.assign(FolderService.folders[i], folder);
          folderUpdated = true;
          break;
        }
      }
      // add the new folder.
      if (folderUpdated === false) {
        FolderService.folders.push(folder);
      }
    }
  }

  static getFolderById (moduleId, folderId) {
    if (!folderId) {
      return new Promise((resolve) => {
        resolve(NPFolder.of(moduleId, NPFolder.ROOT, AccountService.currentUser()));
      });
    }

    let folderObj = null;

    if (FolderService.folders && FolderService.folders.length > 0 &&
        FolderService.folders[0].moduleId === moduleId) {
      FolderService.folders.forEach(function (item) {
        if (item.folderId === folderId) {
          folderObj = item;
        }
      });

      if (folderObj !== null) {
        let p = new Promise((resolve) => {
          resolve(folderObj);
        });
        return p;
      }
    }

    let folder = NPFolder.of(moduleId, folderId);
    return FolderService.get(folder);
  }

  static clear () {
    FolderService.folders = null;
  }
}
