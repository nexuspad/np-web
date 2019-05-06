<template>
  <div>
    <move-to-folder-modal :moduleId="entry.moduleId" ref="folderTreeModalRef" @moveEntryFolderSelected="performMove" />
    <delete-confirm-modal ref="deleteConfirmModalRef" @deleteEntryConfirmed="deleteEntry" />
    <update-tag-modal ref="updateTagModalRef" />
    <b-button-group>
      <b-button v-b-tooltip.hover title="favorite" @click="togglePin(entry)"
        v-if="actionIsAvailable('pin', entry)">
        <i class="far fa-star" v-bind:class="{fas:entry.pinned, far:!entry.pinned}"></i>
      </b-button>
      <b-button v-b-tooltip.hover title="edit" @click="goEntryRoute(entry, 'edit', entry.folder, '')" 
        v-if="actionIsAvailable('edit', entry)">
        <i class="far fa-edit"></i>
      </b-button>
      <b-button v-b-tooltip.hover title="attach" @click="showUploader()" v-if="actionIsAvailable('attach', entry)">
        <i class="fas fa-paperclip"></i>
      </b-button>
      <b-button v-b-tooltip.hover title="tags" v-if="actionIsAvailable('tags', entry)" @click="openUpdateTagModal(entry)">
        <i class="fas fa-tags"></i>
      </b-button>
      <b-button v-b-tooltip.hover title="move" @click="openFolderTreeModal(entry)" v-if="actionIsAvailable('move', entry)">
        <i class="far fa-folder-open"></i>
      </b-button>
      <b-button v-b-tooltip.hover title="download" v-if="actionIsAvailable('download', entry)">
        <a class="fas fa-download unstyled" :href="entry.downloadLink" target="_blank" download></a>
      </b-button>
      <b-button v-b-tooltip.hover title="delete" v-if="actionIsAvailable('delete', entry)" @click="openDeleteConfirmModel(entry)">
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
  props: ['entry', 'folder'],
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
    }
  }
}
</script>

<style>

</style>
