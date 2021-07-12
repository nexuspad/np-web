<template>
  <div>
    <message :location="'TOP_STICKY'" />
    <div class="mt-1 mb-2 np-list-menu-bar">
      <div class="btn-toolbar">
        <div class="btn-group mr-1">
          <button class="btn btn-danger" @click="emptyTrash" :disabled="isEmpty">{{npContent('empty all')}}</button>
          <button class="btn btn-light" @click="loadList()"><i class="fas fa-sync" v-bind:class="{ 'fa-spin': loading || deleting }"></i></button>
        </div>
      </div>
    </div>
    <div v-if="deleting" class="alert alert-light"><small>* {{npContent('it may take a few seconds to delete all items')}}</small></div>
    <empty :list=true v-if="isEmpty" />
    <div class="np-content-below-menu trash">
      <div v-if="entryList.folder && entryList.folder.subFolders.length > 0">
        <div class="row" v-for="group in Math.ceil(entryList.folder.subFolders.length / 3)" v-bind:key="group">
          <div class="col" v-for="folder in entryList.folder.subFolders.slice((group - 1) * 3, group * 3)" v-bind:key="folder.folderId">
            <div class="row m-2">
              <div class="input-group">
                <button class="btn btn-light dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                  {{folder.folderName}}
                </button>
                <ul class="dropdown-menu">
                  <li>
                    <a class="dropdown-item" @click="restoreFolder(folder)">{{npContent('restore')}}</a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-if="entryList.entries && entryList.entries.length > 0">
        <div class="row" v-for="group in Math.ceil(entryList.entries.length / 3)" v-bind:key="group">
          <div class="col" v-for="entry in entryList.entries.slice((group - 1) * 3, group * 3)" v-bind:key="entry.entryId">
            <div class="row m-2">
              <div class="input-group">
                <button class="btn btn-light dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                  {{entry.title}}
                </button>
                <ul class="dropdown-menu">
                  <li>
                    <a class="dropdown-item" @click="restoreEntry(entry)">{{npContent('restore')}}</a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Message from '../common/Message';
import Empty from '../common/Empty';
import EntryActionProvider from './EntryActionProvider';
import FolderActionProvider from './FolderActionProvider.js';
import ListServiceFactory from '../../core/service/ListServiceFactory';
import AccountService from '../../core/service/AccountService';
import EntryService from '../../core/service/EntryService';
import FolderService from '../../core/service/FolderService';
import EventManager from '../../core/util/EventManager';
import AppEvent from '../../core/util/AppEvent';
import NPFolder from '../../core/datamodel/NPFolder';
import AppRoute from '../AppRoute';
import SiteProvider from './SiteProvider';

export default {
  name: 'Trashed',
  mixins: [ EntryActionProvider, FolderActionProvider, SiteProvider ],
  components: {
    Message, Empty
  },
  data () {
    return {
      loading: false, 
      isEmpty: false,
      deleting: false,
      entryList: {}
    };
  },
  mounted () {
    EventManager.subscribe(AppEvent.LOADING, this.isLoading);
    this.loadList();
  },
  methods: {
    isLoading (loading) {
      this.loading = loading;
    },
    loadList: function () {
      // page refresh. the moduleId won't be in the props.
      if (!this.moduleId) {
        this.moduleId = AppRoute.module(this.$route);
      }
      let componentSelf = this;
      AccountService.hello()
        .then(function () {
          componentSelf.listService = ListServiceFactory.locate({
            moduleId: componentSelf.moduleId,
            folderId: NPFolder.TRASH
          });
          componentSelf.listService.getTrashed(componentSelf.moduleId)
            .then(function (entryList) {
              componentSelf.entryList = entryList;
              if ((!entryList.entries || entryList.entries.length === 0) &&
                  (!entryList.folder || entryList.folder.subFolders.length === 0))
              {
                componentSelf.isEmpty = true;
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
    restoreFolder (folder) {
      let componentSelf = this;
      AccountService.hello()
        .then(function () {
          FolderService.restore(folder)
            .then(function (folder) {
              let index = -1;
              for (let i = 0; i < componentSelf.entryList.folder.subFolders.length; i++) {
                if (componentSelf.entryList.folder.subFolders[i].folderId === folder.folderId) {
                  index = i;
                }
              }
              if (index !== -1) {
                componentSelf.entryList.folder.subFolders.splice(index, 1);
              }
              EventManager.publish(AppEvent.FOLDER_RELOAD_EVENT, folder);
            })
            .catch(function (error) {
              console.log(error);
            });
        })
        .catch(function (error) {
          console.log(error);
        });
    },
    restoreEntry: function (entry) {
      let componentSelf = this;
      AccountService.hello()
        .then(function () {
          EntryService.restore(entry)
            .then(function (restoredEntry) {
              componentSelf.entryList.deleteEntry(restoredEntry);
              EventManager.publishAppEvent(AppEvent.ofSuccess(AppEvent.ENTRY_RESTORE, restoredEntry));
            })
            .catch(function (error) {
              EventManager.publishAppEvent(AppEvent.ofFailure(AppEvent.ENTRY_RESTORE, error));
              console.log(error);
            });
        })
        .catch(function (error) {
          console.log(error);
        });
    },
    emptyTrash () {
      this.deleting = true;
      let componentSelf = this;
      AccountService.hello()
        .then(function () {
          EntryService.emptyTrash(componentSelf.moduleId)
            .then(function () {
              // wait a few seconds then refresh the page
              setTimeout(function () {
                componentSelf.deleting = false;
                componentSelf.loadList();
                EventManager.publishAppEvent(AppEvent.ofSuccess(AppEvent.EMPTY_TRASH));
              }, 3000);
            })
            .catch(function (error) {
              componentSelf.deleting = false;
              EventManager.publishAppEvent(AppEvent.ofFailure(AppEvent.EMPTY_TRASH, error));
              console.log(error);
            });
        })
        .catch(function (error) {
          componentSelf.deleting = false;
          console.log(error);
        });
    }
  },
  beforeUnmount () {
    EventManager.unSubscribe(AppEvent.LOADING);
  }
};
</script>

<style>
.trash .btn-link { color: #222222 !important; }
.trash .btn-link:hover { text-decoration: none !important; }
</style>

