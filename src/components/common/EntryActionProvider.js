import NPModule from '../../core/datamodel/NPModule';
import AccountService from '../../core/service/AccountService';
import EntryService from '../../core/service/EntryService';
import EventService from '../../core/service/EventService';
import EventManager from '../../core/util/EventManager';
import AppEvent from '../../core/util/AppEvent';
import AppRoute from '../AppRoute';
import NPEntry from '../../core/datamodel/NPEntry';
import BulkOperation from '../../core/datamodel/BulkOperation';
import NPEvent from '../../core/datamodel/NPEvent';

export default {
  methods: {
    goEntryRoute: function (entry, type, folder, searchKeyword) {
      let params = { entryId: entry.entryId, folderId: folder.folderId }
      if (entry.moduleId === NPModule.EVENT) {
        params['recurId'] = entry.recurId;
      }
      let route;
      if (folder.isMyFolder()) {
        route = {
          name: AppRoute.entryRouteName(entry, type),
          params: params
        };  
      } else {
        params.user = folder.getOwnerId();
        route = {
          name: AppRoute.sharedEntryRouteName(entry, type),
          params: params
        };  
      }
      if (searchKeyword) {
        route.query = { keyword: searchKeyword };
      }
      this.$router.push(route);
    },
    openFolderTreeModal: function (itemToMove) {
      this.$refs.folderTreeModalRef.showModal(itemToMove);
    },
    openDeleteConfirmModel: function (entry) {
      this.$refs.deleteConfirmModalRef.showModal(entry);
    },
    openBulkDeleteConfirmModel: function (folder, entryIdsArr) {
      this.$refs.deleteConfirmModalRef.showModal(new BulkOperation(folder, entryIdsArr));
    },
    openUpdateTagModal: function (entry) {
      this.$refs.updateTagModalRef.showModal(entry);
    },
    addEntryEditor (folder) {
      let routeName;
      switch (folder.moduleId) {
        case NPModule.CONTACT:
          routeName = 'newContact';
          break;
        case NPModule.CALENDAR:
          routeName = 'newEvent';
          break;
        case NPModule.BOOKMARK:
          routeName = 'newBookmark';
          break;
        case NPModule.DOC:
          routeName = 'newDoc';
          break;
        case NPModule.PHOTO:
          this.toggleUploader();
          break;
        default:
          break;
      }
      this.$router.push({ name: routeName, params: { folderId: folder.folderId } });
    },
    save: function ($event, entry, updateOption) {
      if ($event) {
        $event.preventDefault();
      }
      let componentSelf = this;
      AccountService.hello()
        .then(function () {
          let futurePromise;
          if (entry instanceof NPEvent) {
            futurePromise = EventService.save(entry, updateOption);
          } else {
            futurePromise = EntryService.save(entry);
          }
          futurePromise
            .then(function (updatedObj) {
              EventManager.publishAppEvent(AppEvent.ofSuccess(AppEvent.ENTRY_UPDATE, updatedObj));
              if ($event) {
                // saving by clicking the button
                componentSelf.$router.back();
              } else {
                // stay on the same page
                Object.assign(entry, updatedObj);
              }
            })
            .catch(function (error) {
              console.error(error);
              EventManager.publishAppEvent(AppEvent.ofFailure(AppEvent.ENTRY_UPDATE, error));
            });
        })
        .catch(function (error) {
          console.error(error);
        });
    },
    cancel: function () {
      this.$router.back();
    },
    togglePin: function (entry) {
      entry.pinned = !entry.pinned;
      AccountService.hello()
        .then(function () {
          EntryService.updatePin(entry)
            .then(function (updatedEntry) {
              entry.pinned = updatedEntry.pinned;
              EventManager.publishAppEvent(AppEvent.ofSuccess(AppEvent.ENTRY_UPDATE, entry));
            })
            .catch(function (error) {
              console.log(error);
            });
        })
        .catch(function (error) {
          console.log(error);
        });
    },
    updateTitle: function (entry) {
      let componentSelf = this;
      AccountService.hello()
        .then(function () {
          EntryService.updateTitle(entry)
            .then(function (updatedEntry) {
              EventManager.publishAppEvent(AppEvent.ofSuccess(AppEvent.ENTRY_UPDATE, updatedEntry));
              componentSelf.editTitle = false;
            })
            .catch(function (error) {
              EventManager.publishAppEvent(AppEvent.ofFailure(AppEvent.ENTRY_UPDATE, error));
              console.log(error);
            });
        })
        .catch(function (error) {
          console.log(error);
        });
    },
    updateWeight: function (entry) {
      AccountService.hello()
        .then(function () {
          EntryService.updateWeight(entry)
            .then(function () {
            })
            .catch(function (error) {
              console.log(error);
            });
        })
        .catch(function (error) {
          console.log(error);
        });
    },
    deleteEntry: function ({entry: entry, updateOption: updateOption}) {
      AccountService.hello()
        .then(function () {
          if (entry instanceof NPEvent) {
            EventService.delete(entry, updateOption)
            .then(function (deletedEntry) {
              EventManager.publishAppEvent(AppEvent.ofSuccess(AppEvent.ENTRY_DELETE, deletedEntry));
            })
            .catch(function (error) {
              console.log(error);
              EventManager.publishAppEvent(AppEvent.ofFailure(AppEvent.ENTRY_DELETE, error));
            });
          } else {
            EntryService.delete(entry)
            .then(function (deletedEntry) {
              EventManager.publishAppEvent(AppEvent.ofSuccess(AppEvent.ENTRY_DELETE, deletedEntry));
            })
            .catch(function (error) {
              console.log(error);
              EventManager.publishAppEvent(AppEvent.ofFailure(AppEvent.ENTRY_DELETE, error));
            });
          }
        })
        .catch(function (error) {
          console.log(error);
        });
    },
    bulkDeleteEntries: function (bulkDeleteObj) {
      let folder = bulkDeleteObj.folder;
      let entryIdsArr = bulkDeleteObj.entryIdsArr;
      let componentSelf = this;
      AccountService.hello()
        .then(function () {
          EntryService.bulkDelete(folder, entryIdsArr)
            .then(function () {
              EventManager.publishAppEvent(AppEvent.ofSuccess(AppEvent.ENTRY_DELETE, bulkDeleteObj));
              while (componentSelf.bulkEditIds.length > 0) {
                componentSelf.bulkEditIds.pop();
              }
            })
            .catch(function (error) {
              EventManager.publishAppEvent(AppEvent.ofFailure(AppEvent.ENTRY_DELETE, error, bulkDeleteObj));
              console.log(error);
            });
        })
        .catch(function (error) {
          console.log(error);
        });
    },
    moveToFolder: function (itemToMove, fromFolder, toFolder) {
      // update the parent folder
      if (itemToMove instanceof NPEntry) {
        AccountService.hello()
          .then(function () {
            EntryService.updateFolder(itemToMove)
              .then(function (entry) {
                EventManager.publishAppEvent(AppEvent.ofSuccess(AppEvent.ENTRY_MOVE, entry));
              })
              .catch(function (error) {
                EventManager.publishAppEvent(AppEvent.ofFailure(AppEvent.ENTRY_MOVE, error));
                console.log(error);
              });
          })
          .catch(function (error) {
            console.log(error);
          });
      } else if (itemToMove instanceof Array) {
        // move multiple entries
        AccountService.hello()
          .then(function () {
            EntryService.bulkMove(itemToMove, fromFolder, toFolder)
              .then(function () {
                EventManager.publishAppEvent(AppEvent.ofSuccess(AppEvent.ENTRY_MOVE, new BulkOperation(toFolder, itemToMove)));
                while (itemToMove.length > 0) {
                  itemToMove.pop();
                }
              })
              .catch(function (error) {
                EventManager.publishAppEvent(AppEvent.ofFailure(AppEvent.ENTRY_MOVE, error, new BulkOperation(toFolder, itemToMove)));
                console.log(error);
              });
          })
          .catch(function (error) {
            console.log(error);
          });
      }
    },
    navigateToFolder (folder) {
      if (!folder) {
        if (this.entryObj && this.entryObj.folder) {
          // entryObj is declared in EntryView.vue
          folder = this.entryObj.folder;
        }
      }
      if (folder) {
        if (folder.isMyFolder()) {
          this.$router.push({ name: AppRoute.folderRouteName(folder), params: { folderId: folder.folderId } });
        } else {
          this.$router.push({ name: AppRoute.sharedFolderRouteName(folder),
            params: { user: folder.owner.userId, folderId: folder.folderId } });
        }
      }
    },
    actionIsAvailable (actionName, entry) {
      switch (actionName) {
        case 'pin':
          if (entry.isMine()) {
            return true;
          }
          return false;
        case 'edit':
          if (entry.moduleId === NPModule.PHOTO) {
            return false;
          }
          if (entry.hasWritePermission())
            return true;
          return false;
        case 'tags':
          if (entry.hasWritePermission())
            return true;
          return false;
        case 'attach':
          if (entry.moduleId === NPModule.DOC && entry.hasWritePermission()) {
            return true;
          }
          return false;
        case 'move':
          if (entry.isMine()) {
            return true;
          }
          return false;
        case 'delete':
          if (entry.hasWritePermission())
            return true;
          return false;
        case 'download':
          if (entry.moduleId === NPModule.PHOTO && entry.downloadLink) {
            return true;
          }
          return false;
        default:
          return false;
      }
    }
  }
}
