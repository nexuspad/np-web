import AccountService from '../../core/service/AccountService';
import FolderService from '../../core/service/FolderService';
import SharedFolderService from '../../core/service/SharedFolderService';
import NPModule from '../../core/datamodel/NPModule';
import AppRoute from '../AppRoute';
import EventManager from '../../core/util/EventManager';
import AppEvent from '../../core/util/AppEvent';
import NPFolder from '../../core/datamodel/NPFolder';
import UserLookupService from '../../core/service/UserLookupService';
import AccessPermission from '../../core/datamodel/AccessPermission';
import NPUser from '../../core/datamodel/NPUser';

export default {
  methods: {
    onFolderChangeEvent: function (folder) {
      this.folder = folder;
      this.$router.push({ name: AppRoute.folderRouteName(folder), params: { folderId: folder.folderId } });
    },
    locateRouteFolder (moduleId, routeParam) {
      return new Promise((resolve) => {
        let componentSelf = this;
        if (routeParam.folderId) {
          // to-do need to check if the user is current user
          if (routeParam.user) {
            AccountService.hello()
              .then(() => {
                UserLookupService.getUser({ userId: routeParam.user })
                  .then((owner) => {
                    SharedFolderService.getFolderById(moduleId, routeParam.folderId, owner)
                      .then(function (folderObj) {
                        // To ensure Vue component reactive the object change property, Object.assign must be used here
                        // because doing component.folder = folderObj only points to a new reference and won't trigger
                        // the re-activity.
                        // also need to keep in mind: Object.assign won't copy methods.
                        NPFolder.makeCopy(folderObj, componentSelf.folder);
                        FolderService.setCurrent(folderObj)
                        resolve();
                      })
                      .catch(function (error) {
                        console.log(error);
                      });
                  })
                  .catch(function (error) {
                    console.log(error);
                  });
              })
              .catch(function (error) {
                console.log(error);
              });
          } else {
            AccountService.hello()
              .then(() => {
                FolderService.getFolderById(moduleId, routeParam.folderId)
                  .then(function (folderObj) {
                    NPFolder.makeCopy(folderObj, componentSelf.folder);
                    FolderService.setCurrent(folderObj)
                    resolve();
                  })
                  .catch(function (error) {
                    console.log(error);
                  });
              })
              .catch(function (error) {
                console.log(error);
              });
          }
        } else {
          // ROOT folder
          if (routeParam.user) {
            AccountService.hello()
              .then(() => {
                SharedFolderService.getFolderById(moduleId, 0, NPUser.newFromId(routeParam.user))
                .then(function (folderObj) {
                  NPFolder.makeCopy(folderObj, componentSelf.folder);
                  FolderService.setCurrent(folderObj)
                  resolve();
                })
                .catch(function (error) {
                  console.log(error);
                });
              })
              .catch(function (error) {
                console.log(error);
              });
          } else {
            AccountService.hello()
              .then(() => {
                let root = NPFolder.of(moduleId, NPFolder.ROOT, AccountService.currentUser(), AccessPermission.ofOwnerDefault(AccountService.currentUser().userId))
                NPFolder.makeCopy(root, componentSelf.folder)
                FolderService.setCurrent(root)
                resolve();
              })
              .catch(function (error) {
                console.log(error);
              });
          }
        }
      });
    },
    navigateToParentFolder (folder) {
      if (folder.isMyFolder()) {
        this.$router.push({ name: AppRoute.folderRouteName(folder), params: { folderId: folder.parent.folderId } });
      } else {
        this.$router.push({ name: AppRoute.sharedFolderRouteName(folder),
          params: { user: folder.owner.userId, folderId: folder.parent.folderId } });
      }
    },
    updateFolderEditor (folder) {
      let routeName;
      switch (folder.moduleId) {
        case NPModule.CONTACT:
          routeName = 'updateContactFolder';
          break;
        case NPModule.CALENDAR:
          routeName = 'updateCalendar';
          break;
        case NPModule.BOOKMARK:
          routeName = 'updateBookmarkFolder';
          break;
        case NPModule.DOC:
          routeName = 'updateDocFolder';
          break;
        case NPModule.PHOTO:
          routeName = 'updatePhotoFolder';
          break;
        default:
          break;
      }
      this.$router.push({ name: routeName, params: { folderId: folder.folderId } });
    },
    addFolderEditor (folder) {
      let routeName;
      switch (folder.moduleId) {
        case NPModule.CONTACT:
          routeName = 'newContactFolder';
          break;
        case NPModule.CALENDAR:
          routeName = 'newCalendar';
          break;
        case NPModule.BOOKMARK:
          routeName = 'newBookmarkFolder';
          break;
        case NPModule.DOC:
          routeName = 'newDocFolder';
          break;
        case NPModule.PHOTO:
          routeName = 'newPhotoFolder';
          break;
        default:
          break;
      }
      this.$router.push({ name: routeName, params: { parentFolder: folder } });
    },
    deleteFolder (folder) {
      let componentSelf = this;
      AccountService.hello()
        .then(function () {
          FolderService.delete(folder)
            .then(function (folder) {
              EventManager.publish(AppEvent.FOLDER_RELOAD_EVENT, folder);
              let parentFolder = folder.parent;
              if (parentFolder) {
                componentSelf.$router.push({ name: AppRoute.folderRouteName(parentFolder), params: { folderId: parentFolder.folderId } });
              } else {
                componentSelf.$router.push({ name: AppRoute.moduleHomeRouteName(folder.moduleId) });
              }
            })
            .catch(function (error) {
              console.log(error);
            });
        })
        .catch(function (error) {
          console.log(error);
        });
    },
    stopSharingFolder (folder, user) {
      let componentSelf = this;
      AccountService.hello()
        .then(function () {
          if (!user) {
            user = AccountService.currentUser();
          }
          FolderService.updateSharing(folder, user, false, false)
            .then(function (folder) {
              EventManager.publish(AppEvent.SHARED_FOLDER_RELOAD_EVENT);
              let parentFolder = folder.parent;
              if (parentFolder) {
                componentSelf.$router.push({ name: AppRoute.sharedFolderRouteName(parentFolder), params: { folderId: parentFolder.folderId } });
              } else {
                componentSelf.$router.push({ name: AppRoute.moduleHomeRouteName(folder.moduleId) });
              }
            })
            .catch(function (error) {
              console.log(error);
            });
        })
        .catch(function (error) {
          console.log(error);
        });
    },
    toggleBulkEdit () {
      this.bulkEdit = true;
    },
    updateParentFolder: function (folder) {
      AccountService.hello()
        .then(function () {
          FolderService.move(folder)
            .then(function (folder) {
              EventManager.publish(AppEvent.FOLDER_RELOAD_EVENT, folder);
            })
            .catch(function (error) {
              console.log(error);
            });
        })
        .catch(function (error) {
          console.log(error);
        });
    }
  }
}
