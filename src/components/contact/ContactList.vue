<template>
  <div>
    <message :location="'TOP_STICKY'" />
    <move-to-folder-modal :moduleId="folder.moduleId"
                          ref="folderTreeModalRef"
                          @moveEntryFolderSelected="performMove" />
    <delete-confirm-modal ref="deleteConfirmModalRef"
                          @deleteEntryConfirmed="deleteEntry"
                          @bulkDeleteConfirmed="bulkDeleteEntries" />
    <update-tag-modal ref="updateTagModalRef" />
    <div class="np-list-menu-bar">
      <list-menu :folder="folder"
                :entryIds="bulkEditIds"
                v-on:toggleBulkEdit="bulkEdit = !bulkEdit; bulkEditIds = []"
                v-on:bulkSelection="bulkSelection"
                v-on:refreshList="loadList({refresh: true})"
                v-on:bulkDelete="openBulkDeleteConfirmModel(folder, bulkEditIds)" />
      <nav v-if="groups.length > 0">
        <ul class="pagination">
          <li class="page-item" v-for="g in groups" v-bind:key="g">
            <a class="page-link text-uppercase" :href="'#' + g">{{g}}</a>
          </li>
        </ul>
      </nav>
    </div>
    <!-- make sure the object is populated by checking the folder -->
    <empty :list=true v-if="entryList.folder !==null && entryList.isEmpty()" />
    <div class="np-content-below-menu anchored-grp" v-for="g in groups" v-bind:key="g">
      <div class="lead font-weight-bold text-uppercase mb-1">{{ g }}</div>
      <a class="grp-anchor" :name="g">&nbsp;</a>
      <ul class="list-unstyled">
        <li v-for="item in listByGroups[g]" v-bind:key="item.entryId">
          <div class="row">
            <div class="col">
              <input type="checkbox" :value="item.entryId" v-model="bulkEditIds" v-show="bulkEdit === true" />
              <a v-bind:class="{ pinned: item.pinned }" @click="goEntryRoute(item, 'view', folder)">{{ item.title }}</a>
              <div>
                <ul class="list-inline">
                  <li v-for="tag in item.tags" :key="tag" class="list-inline-item">
                    <span class="badge badge-info">{{ tag }}</span>
                  </li>
                </ul>
              </div>
            </div>
            <div class="col-md-auto align-top">
              <entry-list-menu :folder=folder :entry=item v-if="folder.hasWritePermission() && bulkEdit === false"
                v-on:openUpdateTagModal="openUpdateTagModal"
                v-on:openFolderTreeModal="openFolderTreeModal"
                v-on:openDeleteConfirmModel="openDeleteConfirmModel" />
            </div>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import FolderActionProvider from '../common/FolderActionProvider.js';
import EntryActionProvider from '../common/EntryActionProvider';
import MoveToFolderModal from '../common/MoveToFolderModal';
import DeleteConfirmModal from '../common/DeleteConfirmModal';
import UpdateTagModal from '../common/UpdateTagModal';
import ListMenu from '../common/ListMenu';
import EntryListMenu from '../common/EntryListMenu';
import Empty from '../common/Empty';
import Message from '../common/Message';
import NPModule from '../../core/datamodel/NPModule';
import NPFolder from '../../core/datamodel/NPFolder';
import EntryList from '../../core/datamodel/EntryList';
import ListKey from '../../core/datamodel/ListKey';
import ListServiceFactory from '../../core/service/ListServiceFactory';
import AccountService from '../../core/service/AccountService';
import EventManager from '../../core/util/EventManager';
import AppEvent from '../../core/util/AppEvent';

export default {
  name: 'ContactList',
  mixins: [ FolderActionProvider, EntryActionProvider ],
  data () {
    return {
      groups: [],
      listByGroups: {},
      bulkEdit: false,
      bulkEditIds: [],
      folder: NPFolder.of(NPModule.CONTACT, NPFolder.UNASSIGNED),
      entryList: new EntryList()
    };
  },
  components: {
    ListMenu, EntryListMenu, Message, Empty, MoveToFolderModal, DeleteConfirmModal, UpdateTagModal
  },
  mounted () {
    this.locateRouteFolder(NPModule.CONTACT, this.$route.params).then(() => {
      this.loadList({callBack: this.makeGroups});
    });
    EventManager.subscribe(AppEvent.ENTRY_UPDATE, this.makeGroups);
    EventManager.subscribe(AppEvent.ENTRY_DELETE, this.makeGroups);
    EventManager.subscribe(AppEvent.ENTRY_MOVE, this.makeGroups);
    EventManager.subscribe(AppEvent.ENTRY_RESTORE, this.makeGroups);
  },
  methods: {
    makeGroups () {
      this.entryList.entries = EntryList.sortEntriesBySortKey(this.entryList.entries);
      while (this.groups.length) {
        this.groups.pop();
      }
      this.entryList.entries.forEach(element => {
        if (element.sortKey && element.sortKey.length > 0) {
          let cAt0 = element.sortKey.charAt(0);
          if (this.groups.indexOf(cAt0) === -1) {
            this.groups.push(cAt0);
            this.listByGroups[cAt0] = [];
            this.listByGroups[cAt0].push(element);
          } else {
            this.listByGroups[cAt0].push(element);
          }
        }
      });
    },
    performMove (entry) {
      this.moveToFolder(entry);
    },
    bulkSelection (selection) {
      if (selection === 'all') {
        while (this.bulkEditIds.length) {
          this.bulkEditIds.pop();
        }
        this.entryList.entries.forEach(e => {
          this.bulkEditIds.push(e.entryId);
        });
      } else if (selection === 'none') {
        while (this.bulkEditIds.length) {
          this.bulkEditIds.pop();
        }
      }
    },
    loadList: function ({ refresh = false, callBack = null }) {
      let pageId = 1;
      if (this.pageId) {
        pageId = this.pageId;
      }

      let folderOption = this.folder.folderId;
      if ((this.folder.moduleId === NPModule.CONTACT || this.folder.moduleId === NPModule.CALENDAR) && this.folder.folderId === 0) {
        folderOption = 'all';
      }
      let listQuery = ListKey.ofPaging(this.folder.moduleId, folderOption, this.folder.owner.userId, pageId);

      this.listService = ListServiceFactory.locate({
        moduleId: this.folder.moduleId,
        folderId: this.folder.folderId,
        ownerId: this.folder.getOwnerId()
      });

      let componentSelf = this;
      AccountService.hello()
        .then(function () {
          componentSelf.listService.getEntries(listQuery, refresh)
            .then(function (entryList) {
              componentSelf.entryList = entryList;

              if (callBack !== null) {
                callBack();
              }
            })
            .catch(function (error) {
              console.log(error);
            });
        })
        .catch(function (error) {
          console.log(error);
        });
    }
  },
  watch: {
    '$route.params': function () {
      this.locateRouteFolder(NPModule.CONTACT, this.$route.params).then(() => {
        this.loadList({callBack: this.makeGroups});
      });
    }
  },
  beforeUnmount () {
    EventManager.subscribe(AppEvent.ENTRY_UPDATE, this.makeGroups);
    EventManager.subscribe(AppEvent.ENTRY_DELETE, this.makeGroups);
    EventManager.subscribe(AppEvent.ENTRY_MOVE, this.makeGroups);
    EventManager.subscribe(AppEvent.ENTRY_RESTORE, this.makeGroups);
  }
};
</script>

<style>
.paging { position:sticky; top:110px; background-color:rgba(255, 255, 255, 0.5); z-index: 100; }
.anchored-grp { position: relative; }
.anchored-grp .lead { border-bottom: 1px solid #eeeeee; }
.anchored-grp a.grp-anchor { position: absolute; left: 0; top: -160px; } /* css to make the hash content visible below the fixed header */
</style>
