import NPFolder from '../datamodel/NPFolder';
import NPUser from '../datamodel/NPUser';
import NPError from '../datamodel/NPError'
import BaseService from './BaseService';
import FolderService from './FolderService';
import AccountService from './AccountService';
import PromiseManager from '../util/PromiseManager';
import RestClient from '../util/RestClient';
import ErrorHandler from '../util/ErrorHandler'
import FolderUtil from '../datamodel/FolderUtil';
import AccessPermission from '../datamodel/AccessPermission';
import UserLookupService from './UserLookupService';

export default class SharedFolderService extends BaseService {
  static _moduleId;
  static _sharerFolderMap = new Map();

  // get all shared folders
  static getAllFolders (moduleId, refresh = false) {
    if (SharedFolderService._moduleId !== moduleId) {
      refresh = true;
      SharedFolderService._sharerFolderMap.clear();
      SharedFolderService._moduleId = moduleId;
    }

    if (refresh === false && SharedFolderService._sharerFolderMap.size > 0) {
      let p = new Promise((resolve) => {
        let folderTreeByUser = new Map();
        SharedFolderService._sharerFolderMap.forEach((folders, userId) => {
          let shareRoot = NPFolder.of(moduleId, NPFolder.ROOT, NPUser.newFromId(userId));
          shareRoot.folderName = UserLookupService.getUserDisplayName(userId);
          shareRoot.accessPermission.permission = null;
          folderTreeByUser.set(userId, FolderUtil.convertToTree(FolderUtil.folderArrayCopy(folders), shareRoot));
        });
        resolve(folderTreeByUser);
      });
      return p;
    }

    let uri = BaseService.getSubFoldersEndPoint(NPFolder.of(moduleId, NPFolder.ROOT), true);

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
              if (response.data.sharers && response.data.folders) {
                SharedFolderService._moduleId = moduleId;

                if (response.data.sharers.length === 0) {
                  resolve({});
                }

                SharedFolderService._sharerFolderMap.clear();

                let sharers = response.data.sharers.map(x => new NPUser(x));
                UserLookupService.addUsers(sharers);

                let folders = response.data.folders.map(x => NPFolder.initWith(x));
                folders.forEach(f => {
                  if (!SharedFolderService._sharerFolderMap.has(f.owner.userId)) {
                    SharedFolderService._sharerFolderMap.set(f.owner.userId, []);
                  }
                  SharedFolderService._sharerFolderMap.get(f.owner.userId).push(f);
                });

                let folderTreeByUser = new Map();
                SharedFolderService._sharerFolderMap.forEach((folders, userId) => {
                  let shareRoot = NPFolder.of(moduleId, NPFolder.ROOT, NPUser.newFromId(userId));
                  shareRoot.folderName = UserLookupService.getUserDisplayName(userId);
                  shareRoot.accessPermission.permission = null;
                  folderTreeByUser.set(userId, FolderUtil.convertToTree(FolderUtil.folderArrayCopy(folders), shareRoot));
                });
                resolve(folderTreeByUser);
              } else {
                // resolve empty data set
                resolve(new Map());
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

  static getFolderById (moduleId, folderId, ownerObj) {
    let folderObj = null;

    if (SharedFolderService._moduleId === moduleId && SharedFolderService._sharerFolderMap &&
        SharedFolderService._sharerFolderMap.has(ownerObj.userId)) {
      SharedFolderService._sharerFolderMap.get(ownerObj.userId).forEach(function (f) {
        if (f.folderId === folderId) {
          folderObj = f;
        }
      });

      if (folderObj !== null) {
        let p = new Promise((resolve) => {
          resolve(folderObj);
        });
        return p;
      }
    }

    let folder = NPFolder.of(moduleId, folderId, ownerObj);
    return FolderService.get(folder);
  }

  static declineSharing (folder, user) {
    let accessPermissions = [];
    let access = new AccessPermission();
    access.setSharing(user, false, false);
    accessPermissions.push(access);
    folder.sharings = accessPermissions;
    return SharedFolderService.save(folder, BaseService.UPDATE_SHARINGS);
  }

  static sharers () {
    let users = []
    SharedFolderService._sharerFolderMap.forEach((folders, userId) => {
      users.push({
        userId: userId,
        displayName: UserLookupService.getUserDisplayName(userId),
        userName: UserLookupService.getUserName(userId)
      });
    });
    return users;
  }

  static clear () {
    SharedFolderService._sharerFolderMap = new Map();
  }
}
