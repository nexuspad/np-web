<template>
  <div>
    <move-to-folder-modal :moduleId="entry.moduleId" ref="folderTreeModalRef" @moveEntryFolderSelected="performMove" />
    <delete-confirm-modal ref="deleteConfirmModalRef" @deleteEntryConfirmed="deleteEntry" />
    <update-tag-modal ref="updateTagModalRef" />
    <b-button-group>
      <b-button v-b-tooltip.hover title="favorite" v-if="isAvailable('pin')" @click="togglePin(entry)">
        <i class="far fa-star" v-bind:class="{fas:entry.pinned, far:!entry.pinned}"></i>
      </b-button>
      <b-button v-b-tooltip.hover title="edit" @click="goEntryRoute(entry, 'edit', entry.folder, '')"  v-if="isAvailable('edit')">
        <i class="far fa-edit"></i>
      </b-button>
      <b-button v-b-tooltip.hover title="attach" @click="showUploader()" v-if="isAvailable('attach')">
        <i class="fas fa-paperclip"></i>
      </b-button>
      <b-button v-b-tooltip.hover title="tags" v-if="isAvailable('tags')" @click="openUpdateTagModal(entry)">
        <i class="fas fa-tags"></i>
      </b-button>
      <b-button v-b-tooltip.hover title="move" @click="openFolderTreeModal(entry)" v-if="isAvailable('move')">
        <i class="far fa-folder-open"></i>
      </b-button>
      <b-button v-b-tooltip.hover title="delete" v-if="isAvailable('delete')" @click="openDeleteConfirmModel(entry)">
        <i class="far fa-trash-alt"></i>
      </b-button>
    </b-button-group>
  </div>
</template>

<script>
import MoveToFolderModal from './MoveToFolderModal';
import DeleteConfirmModal from './DeleteConfirmModal';
import UpdateTagModal from './UpdateTagModal';
import EntryActionProvider from './EntryActionProvider';
import EventManager from '../../core/util/EventManager';
import AppEvent from '../../core/util/AppEvent';
import NPModule from '../../core/datamodel/NPModule';

export default {
  name: 'EntryMenu',
  props: ['entry'],
  mixins: [ EntryActionProvider ],
  components: {
    MoveToFolderModal, DeleteConfirmModal, UpdateTagModal
  },
  methods: {
    performMove (destFolder) {
      this.moveToFolder(destFolder, this.entry);
    },
    showUploader () {
      // the event is handled in app.js
      EventManager.publishAppEvent(AppEvent.ofIntention(AppEvent.SHOW_UPLOADER, {folder: this.entry.folder, entry: this.entry}));
    },
    isAvailable (menuName) {
      switch (menuName) {
        case 'pin':
          if (this.entry.isMine()) {
            return true;
          }
          return false;
        case 'edit':
          if (this.entry.moduleId === NPModule.PHOTO) {
            return false;
          }
          return true;
        case 'tags':
          return true;
        case 'attach':
          if (this.entry.moduleId === NPModule.DOC) {
            return true;
          }
          return false;
        case 'move':
          if (this.entry.isMine()) {
            return true;
          }
          return false;
        case 'delete':
          return true;
        case 'download':
          if (this.entry.moduleId === NPModule.PHOTO) {
            return true;
          }
          return false;
        default:
          return false;
      }
    }
  }
}
</script>

<style>

</style>
