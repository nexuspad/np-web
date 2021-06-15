<template>
  <div class="np-module-container">
    <split-panel>
      <template slot:left-pane>
        <folder-tree :moduleId="moduleId" :active-folder-key="folderKey" usage="editor" />
        <shared-folder-tree :moduleId="moduleId" :active-folder-key="folderKey" usage="editor" />
      </template>
      <template slot:right-pane>
        <contact-edit :folder=folder v-if="moduleId === 1" />
        <event-edit :folder=folder :event=entry v-if="moduleId === 2" />
        <bookmark-edit :folder=folder v-if="moduleId === 3" />
        <doc-edit :folder=folder v-if="moduleId === 4" />
      </template>
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
      folderKey: ''
    };
  },
  props: ['entry', 'folder'],
  components: {
    FolderTree, SharedFolderTree, ContactEdit, EventEdit, BookmarkEdit, DocEdit
  },
  beforeMount () {
    this.moduleId = AppRoute.module(this.$route);

    this.folderKey = NPFolder.key({folder: this.folder});
    EventManager.subscribe(AppEvent.ENTRY_MOVE, this.updateFolder);
  },
  beforeUnmount () {
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