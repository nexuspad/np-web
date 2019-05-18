<template>
  <div class="mt-1 mb-2">
    <move-to-folder-modal :moduleId="folder.moduleId"
                          ref="folderTreeModalRef"
                          @bulkMoveFolderSelected="performMoveEntries"
                          @newParentSelected="performMoveFolder" />
    <delete-confirm-modal ref="deleteConfirmModalRef" @deleteFolderConfirmed="deleteFolder" />
    <stop-sharing-confirm-modal ref="stopSharingConfirmModalRef" @stopSharingConfirmed="performStopSharingFolder" />
    <!-- add z-index so dropdown won't become transparent -->
    <div>
      <b-button-toolbar variant="light" size="sm" v-if="!isSearch()">
        <b-button-group class="mr-1" v-show="bulkEdit === false">
          <b-button class="pl-3 pr-3" variant="light" @click="navigateToParentFolder(folder)" v-if="canNavigateUp(folder)">
            <i class="fas fa-level-up-alt flipH" data-fa-transform="flip-h"></i>
          </b-button>
        </b-button-group>
        <!-- folder name with dropdown -->
        <b-button-group class="mr-1" v-show="bulkEdit === false">
          <!-- non-root folder dropdown menu -->
          <b-dropdown v-if="!folder.isRoot()">
            <template slot="button-content">
              {{ folder.folderName }}
            </template>
            <b-dropdown-item @click="updateFolderEditor(folder)" v-if="folder.isMyFolder()">
              <i class="far fa-edit mr-1"></i>update
            </b-dropdown-item>
            <b-dropdown-item @click="openFolderTreeModal(folder)" href="#" v-if="folder.isMyFolder()">
              <i class="far fa-folder-open mr-1"></i>move
            </b-dropdown-item>
            <b-dropdown-item @click="openDeleteConfirmModal(folder)" v-if="folder.isMyFolder()" class="text-danger">
              <i class="far fa-trash-alt mr-1"></i>delete
            </b-dropdown-item>
            <b-dropdown-item @click="openStopSharingConfirmModal(folder)" v-if="!folder.isMyFolder()" class="text-danger">
              <i class="fa fa-stop-circle mr-1"></i>stop sharing
            </b-dropdown-item>
          </b-dropdown>
          <!-- own root folder dropdown menu -->
          <b-dropdown v-if="folder.isRoot() && folder.isMyFolder()">
            <b-dropdown-item @click="updateFolderEditor(folder)"><i class="far fa-edit mr-1"></i>sharing</b-dropdown-item>
          </b-dropdown>
          <!-- shared root folder dropdown menu -->
          <b-dropdown v-if="folder.isRoot() && !folder.isMyFolder() && folder.isRootFolderAndShared()">
            <b-dropdown-item @click="openStopSharingConfirmModal(folder)" class="text-danger">
              <i class="fa fa-stop-circle mr-1"></i>stop sharing
            </b-dropdown-item>
          </b-dropdown>
          <!-- add folder -->
          <b-button variant="primary" @click="addFolderEditor(folder)" v-if="folder.isMyFolder()">
            <i class="fas fa-plus"></i> folder
          </b-button>
          <!-- add entry -->
          <b-button variant="primary" @click="addEntryEditor(folder)" v-if="folder.hasWritePermission() && folder.moduleId !== 6">
            <i class="fas fa-plus"></i> {{ entryName }}
          </b-button>
          <!-- upload -->
          <b-button variant="primary" @click="showUploader()" v-if="uploadEligible() && folder.hasWritePermission()">
            <i class="fas fa-upload"></i> upload
          </b-button>
          <!-- bulk edit -->
          <b-button variant="primary" @click="toggleBulkEdit()" v-if="folder.isMyFolder() && folder.moduleId !== 2">
            <i class="fas fa-highlighter"></i> edit
          </b-button>
          <!-- loading/refresh -->
          <b-button class="pl-3 pr-3" variant="light" v-show="bulkEdit === false" v-on:click="refreshList()">
            <i class="fas fa-sync" v-bind:class="{ 'fa-spin': loading }"></i>
          </b-button>
        </b-button-group>
        <b-button-group class="mr-1" v-show="bulkEdit === true">
          <b-button variant="light"><span class="badge badge-gray">{{ bulkEditCount }}</span></b-button>
          <b-button variant="primary" @click="bulkSelectAction(true)">select all</b-button>
          <b-button variant="primary" @click="bulkSelectAction(false)" v-if="bulkEditCount > 0">clear all</b-button>
          <b-button variant="primary" @click="openFolderTreeModal(null)" :disabled="bulkEditCount === 0">move</b-button>
          <b-button variant="danger" @click="$emit('bulkDelete')" :disabled="bulkEditCount === 0">delete</b-button>
          <b-button variant="light" @click="toggleBulkEdit()">done</b-button>
        </b-button-group>
      </b-button-toolbar>
      <b-button-toolbar variant="light" size="sm" v-if="isSearch() && folder.isMyFolder()">
        <b-button-group class="mr-1" v-show="bulkEdit === false">
          <b-button variant="primary" @click="toggleBulkEdit()" v-if="folder.isMyFolder()">
            <i class="fas fa-highlighter"></i> edit
          </b-button>
          <b-button class="pl-3 pr-3" variant="light" v-show="bulkEdit === false" @click="refreshList()">
            <i class="fas fa-sync" v-bind:class="{ 'fa-spin': loading }"></i>
          </b-button>
        </b-button-group>
        <b-button-group class="mr-1" v-show="bulkEdit === true">
          <b-button variant="light"><span class="badge badge-gray">{{ bulkEditCount }}</span></b-button>
          <b-button variant="primary" @click="bulkSelectAction(true)">select all</b-button>
          <b-button variant="primary" @click="bulkSelectAction(false)" v-if="bulkEditCount > 0">clear all</b-button>
          <b-button variant="primary" @click="openFolderTreeModal(null)" :disabled="bulkEditCount === 0">move</b-button>
          <b-button variant="danger" @click="$emit('bulkDelete')" :disabled="bulkEditCount === 0">delete</b-button>
          <b-button variant="light" @click="toggleBulkEdit()">done</b-button>
        </b-button-group>
      </b-button-toolbar>
    </div>
  </div>
</template>

<script>
import EntryActionProvider from './EntryActionProvider.js';
import FolderActionProvider from './FolderActionProvider.js';
import MoveToFolderModal from './MoveToFolderModal';
import DeleteConfirmModal from './DeleteConfirmModal';
import StopSharingConfirmModal from './StopSharingConfirmModal';
import NPModule from '../../core/datamodel/NPModule';
import EventManager from '../../core/util/EventManager';
import AppEvent from '../../core/util/AppEvent';

export default {
  name: 'ListMenu',
  mixins: [ FolderActionProvider, EntryActionProvider ],
  props: ['searchKeyword', 'folder', 'entryIds'],
  components: {
    MoveToFolderModal, DeleteConfirmModal, StopSharingConfirmModal
  },
  data: function () {
    return {
      loading: false,
      bulkEdit: false
    }
  },
  computed: {
    entryName: function () {
      if (!this.folder) {
        return;
      }
      switch (this.folder.moduleId) {
        case NPModule.CONTACT:
          return 'contact';
        case NPModule.CALENDAR:
          return 'event';
        case NPModule.BOOKMARK:
          return 'bookmark';
        case NPModule.DOC:
          return 'doc';
        case NPModule.PHOTO:
          return 'photo';
        default:
          break;
      }
    },
    bulkEditCount: function () {
      if (this.entryIds) {
        return this.entryIds.length;
      }
      return 0;
    }
  },
  mounted () {
    EventManager.subscribe(AppEvent.LOADING, this.isLoading);
  },
  beforeDestroy () {
    EventManager.unSubscribe(AppEvent.LOADING);
  },
  methods: {
    isLoading (loading) {
      this.loading = loading;
    },
    isSearch () {
      if (this.searchKeyword && this.searchKeyword.length > 0) {
        return true;
      }
      return false;
    },
    canNavigateUp (theFolder) {
      if (theFolder.isMyFolder() && theFolder.parent) {
        return true;
      } else {
        if (theFolder.parent && theFolder.parent.folderId !== 0) {
          return true;
        }
        return false;
      }
    },
    toggleBulkEdit () {
      // emit the event
      this.$emit('toggleBulkEdit');
      this.bulkEdit = !this.bulkEdit;
    },
    bulkSelectAction (yes) {
      if (yes) {
        this.$emit('bulkSelection', 'all');
      } else {
        this.$emit('bulkSelection', 'none');
      }
    },
    refreshList () {
      this.$emit('refreshList');
    },
    openDeleteConfirmModal (theFolder) {
      this.$refs.deleteConfirmModalRef.showModal(theFolder);
    },
    openStopSharingConfirmModal (theFolder) {
      this.$refs.stopSharingConfirmModalRef.showModal(theFolder);
    },
    performMoveEntries (destFolder) {
      this.moveToFolder(this.entryIds, this.folder, destFolder);
    },
    performMoveFolder (theFolder) {
      this.updateParentFolder(theFolder);
    },
    performStopSharingFolder (theFolder) {
      this.stopSharingFolder(theFolder);
    },
    uploadEligible() {
      if (this.folder.moduleId === NPModule.DOC || this.folder.moduleId === NPModule.PHOTO) {
        return true;
      }
      return false;
    },
    showUploader () {
      EventManager.publishAppEvent(AppEvent.ofIntention(AppEvent.SHOW_UPLOADER, {folder: this.folder}));
    }
  }
}
</script>

<style>
.flipH {
  -moz-transform: scaleX(-1);
  -o-transform: scaleX(-1);
  -webkit-transform: scaleX(-1);
  transform: scaleX(-1);
  filter: FlipH;
  -ms-filter: "FlipH";
}
</style>
