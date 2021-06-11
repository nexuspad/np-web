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
      <div class="btn-toolbar" v-if="!isSearch()">
        <div class="btn-group mr-1" v-show="bulkEdit === false">
          <a class="pl-3 pr-3 btn btn-light"
           @click="navigateToParentFolder(folder)" v-if="canNavigateUp(folder)">
            <i class="fas fa-level-up-alt flipH" data-fa-transform="flip-h"></i>
          </a>
        </div>
        <!-- folder name with dropdown -->
        <div class="input-group" v-if="!folder.isRoot()">
          <button class="btn btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
            {{ folder.folderName }}
          </button>
          <ul class="dropdown-menu">
            <li>
              <a class="dropdown-item" @click="updateFolderEditor(folder)" v-if="folder.isMyFolder()">
                <i class="far fa-edit mr-1"></i>{{npContent('update')}}
              </a>
            </li>
            <li>
              <a class="dropdown-item" @click="openFolderTreeModal(folder)" href="#" v-if="folder.isMyFolder()">
                <i class="far fa-folder-open mr-1"></i>{{npContent('move')}}
              </a>
            </li>
            <li>
              <a class="dropdown-item text-danger" @click="openDeleteConfirmModal(folder)" v-if="folder.isMyFolder()">
                <i class="far fa-trash-alt mr-1"></i>{{npContent('delete')}}
              </a>
            </li>
            <li>
              <a class="dropdown-item text-danger" @click="openStopSharingConfirmModal(folder)" v-if="!folder.isMyFolder()">
                <i class="fa fa-stop-circle mr-1"></i>{{npContent('stop sharing')}}
              </a>
            </li>
          </ul>
        </div>
        <div class="input-group" v-if="folder.isRoot()">
          <button class="btn btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
            {{ folder.folderName }}
          </button>
          <ul class="dropdown-menu">
            <li>
              <a class="dropdown-item" @click="updateFolderEditor(folder)">
                <i class="far fa-edit mr-1"></i>{{npContent('sharing')}}
              </a>
            </li>
            <li>
              <a class="dropdown-item text-danger" @click="openStopSharingConfirmModal(folder)">
                <i class="fa fa-stop-circle mr-1"></i>{{npContent('stop sharing')}}
              </a>
            </li>
          </ul>
        </div>
        <div class="btn-group mr-1" v-show="bulkEdit === false">
          <!-- add folder -->
          <a class="btn btn-primary"
           @click="addFolderEditor(folder)" v-if="folder.isMyFolder()">
            <i class="fas fa-plus"></i> {{npContent('folder')}}
          </a>
          <!-- add entry -->
          <a class="btn btn-primary"
           @click="addEntryEditor(folder)" v-if="folder.hasWritePermission() && folder.moduleId !== 6">
            <i class="fas fa-plus"></i> {{npContent(folder.moduleId.toString())}}
          </a>
          <!-- upload -->
          <a class="btn btn-primary"
           @click="showUploader()" v-if="uploadEligible() && folder.hasWritePermission()">
            <i class="fas fa-upload"></i> {{npContent('upload')}}
          </a>
          <!-- bulk edit -->
          <a class="btn btn-primary"
           @click="toggleBulkEdit()" v-if="folder.isMyFolder() && folder.moduleId !== 2">
            <i class="fas fa-highlighter"></i> {{npContent('edit')}}
          </a>
          <!-- loading/refresh -->
          <a class="pl-3 pr-3 btn btn-light"
           v-show="bulkEdit === false" v-on:click="refreshList()">
            <i class="fas fa-sync" v-bind:class="{ 'fa-spin': loading }"></i>
          </a>
        </div>
        <div class="btn-group mr-1" v-show="bulkEdit === true">
          <a class="btn btn-light"><span class="badge badge-gray">{{ bulkEditCount }}</span></a>
          <a class="btn btn-primary" @click="bulkSelectAction(true)">{{npContent('select all')}}</a>
          <a class="btn btn-primary" @click="bulkSelectAction(false)" v-if="bulkEditCount > 0">{{npContent('clear all')}}</a>
          <a class="btn btn-primary" @click="openFolderTreeModal(null)" :disabled="bulkEditCount === 0">{{npContent('move')}}</a>
          <a class="btn btn-danger" @click="$emit('bulkDelete')" :disabled="bulkEditCount === 0">{{npContent('delete')}}</a>
          <a class="btn btn-light" @click="toggleBulkEdit()">{{npContent('done')}}</a>
        </div>
      </div>
      <div class="btn-toolbar" v-if="isSearch() && folder.isMyFolder()">
        <div class="btn-group mr-1" v-show="bulkEdit === false">
          <a class="btn btn-primary"
           @click="toggleBulkEdit()" v-if="folder.isMyFolder()">
            <i class="fas fa-highlighter"></i> {{npContent('edit')}}
          </a>
          <a class="pl-3 pr-3 btn btn-light"
           v-show="bulkEdit === false" @click="refreshList()">
            <i class="fas fa-sync" v-bind:class="{ 'fa-spin': loading }"></i>
          </a>
        </div>
        <div class="btn-group mr-1" v-show="bulkEdit === true">
          <a class="btn btn-light"><span class="badge badge-gray">{{ bulkEditCount }}</span></a>
          <a class="btn btn-primary" @click="bulkSelectAction(true)">{{npContent('select all')}}</a>
          <a class="btn btn-primary"
           @click="bulkSelectAction(false)" v-if="bulkEditCount > 0">{{npContent('clear all')}}</a>
          <a class="btn btn-primary"
           @click="openFolderTreeModal(null)" :disabled="bulkEditCount === 0">{{npContent('move')}}</a>
          <a class="btn btn-danger" @click="$emit('bulkDelete')" :disabled="bulkEditCount === 0">{{npContent('delete')}}</a>
          <a class="btn btn-light" @click="toggleBulkEdit()">{{npContent('done')}}</a>
        </div>
      </div>
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
import SiteProvider from './SiteProvider';

export default {
  name: 'ListMenu',
  mixins: [ FolderActionProvider, EntryActionProvider, SiteProvider ],
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
      return ''
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
  beforeUnmount () {
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
