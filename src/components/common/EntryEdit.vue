<template>
  <div class="np-module-container">
    <split-panel>
      <div slot="left-pane">
        <folder-tree :moduleId="moduleId" :active-folder-key="folderKey" usage="editor" />
        <shared-folder-tree :moduleId="moduleId" :active-folder-key="folderKey" usage="editor" />
      </div>
      <div slot="right-pane">
        <contact-edit :folder=folder v-if="moduleId === 1" />
        <event-edit :folder=folder :event=entry v-if="moduleId === 2" />
        <bookmark-edit :folder=folder v-if="moduleId === 3" />
        <doc-edit :folder=folder v-if="moduleId === 4" />
      </div>
    </split-panel>
  </div>
</template>

<script>
import FolderTree from '../folder/FolderTree';
import SharedFolderTree from '../folder/SharedFolderTree';
import ContactEdit from '../contact/ContactEdit';
import BookmarkEdit from '../bookmark/BookmarkEdit';
import DocEdit from '../doc/DocEdit';
import EventEdit from '../calendar/EventEdit';
import NPModule from '../../core/datamodel/NPModule';
import AppRoute from '../AppRoute';
import EventManager from '../../core/util/EventManager';
import AppEvent from '../../core/util/AppEvent';
import NPFolder from '../../core/datamodel/NPFolder';

export default {
  name: 'EntryEdit',
  data () {
    return {
      moduleId: NPModule.NOT_ASSIGNED,
      folder: new NPFolder(),
      folderKey: ''
    };
  },
  props: ['entry'],
  components: {
    FolderTree, SharedFolderTree, ContactEdit, EventEdit, BookmarkEdit, DocEdit
  },
  created () {
    this.moduleId = AppRoute.module(this.$route);

    if (this.$route.params.folder) {
      this.folder = this.$route.params.folder;
      this.folderKey = NPFolder.key({folder: this.folder});
    }
    EventManager.subscribe(AppEvent.ENTRY_MOVE, this.updateFolder);
  },
  beforeDestroy () {
    EventManager.unSubscribe(AppEvent.ENTRY_MOVE, this.updateFolder);
  },
  methods: {
    updateFolder (appEvent) {
      let newFolder = appEvent.affectedItem;
      this.folderKey = NPFolder.key({folder: newFolder});
      NPFolder.makeCopy(newFolder, this.folder);
    }
  },
  watch: {
  }
};
</script>