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
      <list-menu :searchKeyword="searchKeyword"
                :folder="folder"
                :entryIds="bulkEditIds"
                v-on:toggleBulkEdit="bulkEdit = !bulkEdit; bulkEditIds = []"
                v-on:bulkSelection="bulkSelection"
                v-on:refreshList="loadList(true)"
                v-on:bulkDelete="openBulkDeleteConfirmModel(folder, bulkEditIds)" />
    </div>
    <!-- make sure the object is populated by checking the folder -->
    <empty :list=true v-if="entryList.folder !== null && entryList.isEmpty()" />
    <ul class="list-unstyled np-content-below-menu" id="EntryList">
      <li v-for="item in entryList.entries" v-bind:key="item.entryId" class="mt-2">
        <div class="row border-bottom">
          <div class="col">
            <input type="checkbox" :value="item.entryId" v-model="bulkEditIds" v-show="bulkEdit === true" />
            <a v-bind:class="{ pinned: item.pinned }" @click="goEntryRoute(item, 'view', folder)">{{ item.title }}</a>
            <a :href="item.webAddress" target="_blank" v-if="item.webAddress">
              <i class="fa fa-external-link-alt"></i>
              <!-- cannot make call on click event. it's causing a weird blank menu bug
              <i class="fa fa-external-link-alt" @click="updateWeight(item)"></i>
              -->
            </a>
            <div>
              <ul class="list-inline">
                <li v-for="tag in item.tags" :key="tag" class="list-inline-item">
                  <span class="badge badge-info">{{ tag }}</span>
                </li>
              </ul>
            </div>
            <p class="description">{{ item.description }}</p>
          </div>
          <div class="col-md-auto">
            <entry-list-menu :folder=folder :entry=item v-if="folder.hasWritePermission() && bulkEdit === false"
              v-on:openUpdateTagModal="openUpdateTagModal"
              v-on:openFolderTreeModal="openFolderTreeModal"
              v-on:openDeleteConfirmModel="openDeleteConfirmModel" />
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
import InfiniteScroll from 'infinite-scroll';
import Empty from './Empty';
import MoveToFolderModal from './MoveToFolderModal';
import DeleteConfirmModal from './DeleteConfirmModal';
import UpdateTagModal from './UpdateTagModal';
import Message from '../common/Message';
import ListMenu from './ListMenu';
import EntryListMenu from './EntryListMenu';
import ListKey from '../../core/datamodel/ListKey';
import ListServiceFactory from '../../core/service/ListServiceFactory';
import AccountService from '../../core/service/AccountService';
import CommonUtils from '../../core/util/CommonUtils';
import EntryActionProvider from './EntryActionProvider';
import EntryList from '../../core/datamodel/EntryList';

export default {
  name: 'InfiniteList',
  mixins: [ EntryActionProvider ],
  components: {
    Message, Empty, ListMenu, EntryListMenu, MoveToFolderModal, DeleteConfirmModal, UpdateTagModal
  },
  props: ['searchKeyword', 'folder'],
  data () {
    return {
      listQueryKey: null,
      entryList: new EntryList(),
      bulkEdit: false,
      bulkEditIds: []
    };
  },
  created () {
    this.loadList();
  },
  methods: {
    loadList: function (refresh = false) {
      // infinite list always loads with page 1
      let pageId = 1;
      // folder may not have been initialized.
      if (!this.folder || !this.folder.isValid()) {
        return;
      }

      this.listService = ListServiceFactory.locate({
        moduleId: this.folder.moduleId,
        folderId: this.folder.folderId,
        ownerId: this.folder.getOwnerId()
      });

      let componentSelf = this;
      AccountService.hello()
        .then(function () {
          componentSelf.listQueryKey = ListKey.ofPaging(componentSelf.folder.moduleId, componentSelf.folder.folderId,
            componentSelf.folder.getOwnerId(), pageId);
          componentSelf.listService.getEntries(componentSelf.listQueryKey, refresh)
            .then(function (entryList) {
              // this is just a reference assignment. this.entryList now points to ListService.entryList
              componentSelf.entryList = entryList;
              componentSelf.infScroller = new InfiniteScroll(document.querySelector('#EntryList'), {
                path: function () {
                  if (entryList && entryList.listSetting && entryList.listSetting.nextPage() !== false) {
                    return CommonUtils.updateQueryStringParameter(componentSelf.$route.path, 'page', entryList.listSetting.nextPage());
                  }
                  return CommonUtils.updateQueryStringParameter(componentSelf.$route.path, 'page', 1);
                },
                loadOnScroll: false,
                checkLastPage: false,
                history: false
              });

              componentSelf.infScroller.on('scrollThreshold', function () {
                componentSelf.loadNextPage();
              });
            })
            .catch(function (error) {
              console.log(error);
            });
        })
        .catch(function (error) {
          console.log(error);
        });
    },
    loadNextPage: function () {
      if (this.entryList.listSetting.nextPage() === false) {
        // console.log('no more page to load');
        return;
      }

      this.listQueryKey = ListKey.ofPaging(this.entryList.listSetting.moduleId,
                                           this.entryList.listSetting.folderId,
                                           this.entryList.listSetting.ownerId,
                                           this.entryList.listSetting.nextPage());
      console.log('load next page..............', this.listQueryKey);

      let componentSelf = this;
      AccountService.hello()
        .then(function () {
          componentSelf.listService.getEntries(componentSelf.listQueryKey)
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
    }
  },
  watch: {
    'folder.folderId': function () {
      this.loadList();
    },
    'folder.owner.userId': function () {
      this.loadList();
    }
  },
  beforeDestroy () {
    if (this.infScroller) {
      this.infScroller.destroy();
    }
  }
};
</script>

<style>
p.description {
  font-size: 80%;
}
</style>