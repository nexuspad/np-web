<template>
  <div>
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
    <div class="np-content-below-menu">
      <ul class="list-unstyled" v-if="listStyle === 'default'">
        <li v-for="item in entries" v-bind:key="item.entryId" class="mt-2">
          <div class="row border-bottom">
            <div class="col">
              <input type="checkbox" :value="item.entryId" v-model="bulkEditIds" v-show="bulkEdit === true" />
              <a v-bind:class="{ pinned: item.pinned }" @click="goEntryRoute(item, 'view', folder, searchKeyword)" v-html="item.title"></a>
              <a :href="item.webAddress" target="_blank" v-if="item.webAddress">
                <i class="fa fa-external-link-alt" @click="updateWeight(item)"></i>
              </a>
              <div>
                <ul class="list-inline">
                  <li v-for="tag in item.tags" :key="tag" class="list-inline-item">
                    <span class="badge badge-info" v-html="tag"></span>
                  </li>
                </ul>
              </div>
              <p class="description" v-html="item.description"></p>
            </div>
            <div class="col-md-auto align-top">
              <div class="col-md-auto">
                <entry-list-menu :folder=folder :entry=item v-if="folder.hasWritePermission() && bulkEdit === false"
                  v-on:openUpdateTagModal="openUpdateTagModal"
                  v-on:openFolderTreeModal="openFolderTreeModal"
                  v-on:openDeleteConfirmModel="openDeleteConfirmModel" />
              </div>
            </div>
          </div>
        </li>
      </ul>
      <div v-if="listStyle === 'grid'">
        <div class="gallery" v-for="(image, imageIndex) in entryList.entries" :key="image.entryId">
          <input type="checkbox" :value="image.entryId" v-model="bulkEditIds" v-show="bulkEdit === true" />
          <entry-list-menu :folder=folder :entry=item v-if="folder.hasWritePermission() && bulkEdit === false"
            v-on:openUpdateTagModal="openUpdateTagModal"
            v-on:openFolderTreeModal="openFolderTreeModal"
            v-on:openDeleteConfirmModel="openDeleteConfirmModel" />
          <div class="image" :class="{pinned:image.pinned}"
            :style="{ backgroundImage: 'url(' + image.lightbox + ')' }" @click="openCarousel(imageIndex)"></div>
        </div>
      </div>
      <nav aria-label="Page navigation" class="np-pagination" v-if="allPageIds.length > 1">
        <ul class="pagination">
          <li class="page-item"><a class="page-link" href="#">previous</a></li>
          <li class="page-item" v-for="p in allPageIds" :key="p">
            <router-link class="page-link" :to="{name: $route.name, params: pageParams(), query: pageQueryParams(p) }">{{ p }}</router-link>
          </li>
          <li class="page-item"><a class="page-link" href="#">next</a></li>
        </ul>
      </nav>
    </div>
  </div>
</template>

<script>
import MoveToFolderModal from './MoveToFolderModal';
import DeleteConfirmModal from './DeleteConfirmModal';
import UpdateTagModal from './UpdateTagModal';
import ListMenu from './ListMenu';
import EntryListMenu from './EntryListMenu';
import EntryActionProvider from './EntryActionProvider';
import ListKey from '../../core/datamodel/ListKey';
import ListServiceFactory from '../../core/service/ListServiceFactory';
import AccountService from '../../core/service/AccountService';

export default {
  name: 'List',
  mixins: [ EntryActionProvider ],
  components: {
    ListMenu, EntryListMenu, MoveToFolderModal, DeleteConfirmModal, UpdateTagModal
  },
  props: ['searchKeyword', 'folder', 'pageId', 'entryList', 'listStyle'],
  data () {
    return {
      selectedPage: 1,
      entries: [],
      allPageIds: [],
      bulkEdit: false,
      bulkEditIds: []
    };
  },
  mounted () {
    this.selectedPage = parseInt(this.pageId);
    if (this.entryList === false) {
      this.loadList();
    } else if (this.entryList === null || typeof this.entryList === 'undefined') {
    } else if (this.entryList.entries && this.entryList.entries.length > 0 && this.entryList.hasEntriesInPage(this.selectedPage)) {
      this.buildPages(this.entryList);
    }
  },
  methods: {
    buildPages: function (entryList) {
      while (this.allPageIds.length) {
        this.allPageIds.pop();
      }
      let totalPages = entryList.listSetting.totalPages();
      for (let i = 1; i <= totalPages; i++) {
        this.allPageIds.push(i);
      }

      while (this.entries.length) {
        this.entries.pop();
      }
      this.entries.push(...entryList.getEntriesInPage(this.selectedPage));
    },
    loadList: function (refresh = false) {
      if (this.searchKeyword) {
        var listQuery = ListKey.ofSearch(this.folder.moduleId, this.folder.getOwnerId(), this.searchKeyword);
      } else {
        listQuery = ListKey.ofPaging(this.folder.moduleId, this.folder.folderId, this.folder.getOwnerId(), this.selectedPage);
      }

      this.listService = ListServiceFactory.locate({
        moduleId: this.folder.moduleId,
        folderId: this.folder.folderId,
        ownerId: this.folder.getOwnerId()
      });

      let componentSelf = this;
      AccountService.hello()
        .then(function (response) {
          componentSelf.listService.getList(listQuery, refresh)
            .then(function (entryList) {
              componentSelf.buildPages(entryList);
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
        this.entries.forEach(e => {
          if (this.bulkEditIds.indexOf(e.entryId) === -1) {
            this.bulkEditIds.push(e.entryId);
          }
        });
      } else if (selection === 'none') {
        while (this.bulkEditIds.length) {
          this.bulkEditIds.pop();
        }
      }
    },
    pageParams: function () {
      return this.$route.params;
    },
    pageQueryParams: function (pageId) {
      let queryParams = Object.assign({}, this.$route.params);
      queryParams = Object.assign(queryParams, this.$route.query);
      queryParams.page = pageId;
      return queryParams;
    },
    openCarousel: function (imageIndex) {
      if (this.folder.folderId === 0) {
        this.$router.push({name: 'photoHomeCarousel', params: {images: this.entryList.entries, imageIndex: imageIndex}});
      } else {
        this.$router.push({name: 'photoFolderCarousel', params: {images: this.entryList.entries, imageIndex: imageIndex}});
      }
    },
  },
  watch: {
    'folder.folderId': function (newFolder) {
      // this.loadList();
    },
    'entryList': function (entryList) {
      // entryList prop may be loaded with delay so need to watch it's content
      console.log('here.....');
      this.buildPages(entryList);
    },
    '$route.query.page': function (value) {
      this.selectedPage = value;
      this.loadList();
    }
  },
  beforeDestroy () {
  }
};
</script>

<style>
</style>