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
                v-on:refreshList="loadList(true)"
                v-on:bulkDelete="openBulkDeleteConfirmModel(folder, bulkEditIds)" />
    </div>
    <!-- make sure the object is populated by checking the folder -->
    <div class="np-content-below-menu" id="Photos">
      <empty :list=true v-if="entryList.folder !==null && entryList.isEmpty()" />
      <div class="gallery" v-for="(item, imageIndex) in entryList.entries" :key="item.entryId">
        <input type="checkbox" :value="item.entryId" v-model="bulkEditIds" v-show="bulkEdit === true" />
        <entry-list-menu :folder=folder :entry=item v-if="folder.hasWritePermission() && bulkEdit === false"
          v-on:openUpdateTagModal="openUpdateTagModal"
          v-on:openFolderTreeModal="openFolderTreeModal"
          v-on:openDeleteConfirmModel="openDeleteConfirmModel" />
        <div class="image" :class="{pinned:item.pinned}"
          :style="{ backgroundImage: 'url(' + item.lightbox + ')' }" @click="openCarousel(imageIndex)"></div>
        <!--
        <div class="desc">{{ image.title }}</div>
        <div class="tag">
          <span v-for="tag in image.tags" :key="tag" class="badge badge-info" v-html="tag"></span>
        </div>
        -->
      </div>
    </div>
  </div>
</template>

<script>
import InfiniteScroll from 'infinite-scroll';
import ListMenu from '../common/ListMenu';
import EntryListMenu from '../common/EntryListMenu';
import Empty from '../common/Empty';
import Message from '../common/Message';
import MoveToFolderModal from '../common/MoveToFolderModal';
import DeleteConfirmModal from '../common/DeleteConfirmModal';
import UpdateTagModal from '../common/UpdateTagModal';
import FolderActionProvider from '../common/FolderActionProvider.js';
import EntryActionProvider from '../common/EntryActionProvider';
import NPModule from '../../core/datamodel/NPModule';
import ListKey from '../../core/datamodel/ListKey';
import ListServiceFactory from '../../core/service/ListServiceFactory';
import NPFolder from '../../core/datamodel/NPFolder';
import AccountService from '../../core/service/AccountService';
import CommonUtils from '../../core/util/CommonUtils';
import EntryList from '../../core/datamodel/EntryList';

export default {
  name: 'Album',
  mixins: [ EntryActionProvider, FolderActionProvider ],
  data () {
    return {
      moduleId: NPModule.PHOTO,
      folder: NPFolder.of(NPModule.PHOTO, NPFolder.UNASSIGNED),
      entryList: new EntryList,
      index: null,
      bulkEdit: false,
      bulkEditIds: []
    };
  },
  components: {
    ListMenu, EntryListMenu, Message, Empty, MoveToFolderModal, DeleteConfirmModal, UpdateTagModal
  },
  created () {
    this.locateRouteFolder(NPModule.PHOTO, this.$route.params).then(() => {
      this.loadList();
    });
  },
  methods: {
    loadList (refresh = false) {
      if (!this.folder || !this.folder.isValid()) {
        return;
      }

      this.listService = ListServiceFactory.locate({
        moduleId: NPModule.PHOTO,
        folderId: this.folder.folderId,
        ownerId: this.folder.getOwnerId()
      });

      let componentSelf = this;
      AccountService.hello()
        .then(function () {
          let listQuery = ListKey.ofPaging(NPModule.PHOTO, componentSelf.folder.folderId, componentSelf.folder.getOwnerId(), 1);
          componentSelf.listService.getEntries(listQuery, refresh)
            .then(function (entryList) {
              componentSelf.entryList = entryList;
              componentSelf.infScroller = new InfiniteScroll(document.querySelector('#Photos'), {
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
      if (!this.entryList || this.entryList.listSetting.nextPage() === false) {
        console.log('no more page to load');
        return;
      }

      let nextPage = this.entryList.listSetting.nextPage();

      if (nextPage === false) {
        console.log('cannot load the next page.');
        return;
      }

      this.listQueryKey = ListKey.ofPaging(this.entryList.listSetting.moduleId,
                                           this.entryList.listSetting.folderId,
                                           this.folder.getOwnerId(),
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
    openCarousel: function (imageIndex) {
      if (this.folder.folderId === 0) {
        this.$router.push({name: 'photoHomeCarousel', params: {images: this.entryList.entries, imageIndex: imageIndex, folder: this.folder}});
      } else {
        this.$router.push({name: 'photoFolderCarousel', params: {images: this.entryList.entries, imageIndex: imageIndex, folder: this.folder}});
      }
    },
    performMove (entry) {
      this.moveToFolder(entry);
    },
    bulkSelection (selection) {
      if (selection === 'all') {
        this.entryList.entries.forEach(e => {
          if (this.bulkEditIds.indexOf(e.entryId) === -1) {
            this.bulkEditIds.push(e.entryId);
          }
        });
      } else if (selection === 'none') {
        while (this.bulkEditIds.length) {
          this.bulkEditIds.pop();
        }
      }
    }
  },
  watch: {
    '$route.params': function () {
      this.locateRouteFolder(NPModule.PHOTO, this.$route.params).then(() => {
        this.loadList();
      });
    }
  },
  beforeDestroy () {
  }
};
</script>

<style scoped>
.np-list-menu-bar {
  position:fixed !important;
  width: 100%;
  padding-right: 1em;
}

.np-content-below-menu {
  margin-top: 60px;
}
</style>
