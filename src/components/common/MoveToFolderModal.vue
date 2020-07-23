<template>
  <b-modal ref="moveToFolderModalRef" size="md" hide-footer :title="npContent('choose a folder')">
    <folder-tree :moduleId="moduleId" :active-folder-key="folderSelectionKey" usage="move" @folderSelected="onFolderSelected" />
  </b-modal>
</template>

<script>
import FolderTree from '../folder/FolderTree';
import NPEntry from '../../core/datamodel/NPEntry';
import NPFolder from '../../core/datamodel/NPFolder';
import SiteProvider from './SiteProvider';

export default {
  name: 'MoveToFolderModal',
  mixins: [ SiteProvider ],
  props: ['moduleId'],
  data () {
    return {
      folderSelectionKey: '',
      item: {}
    };
  },
  components: {
    FolderTree
  },
  methods: {
    showModal (itemToMove) {
      this.$refs.moveToFolderModalRef.show();
      this.item = itemToMove;

      let folder = null;
      if (this.item instanceof NPEntry) {
        folder = this.item.folder;
      } else if (this.item instanceof NPFolder) {
        folder = this.item;
      }

      console.log('item to move', itemToMove);
      console.log('item folder', folder);
      
      if (folder != null) {
        this.folderSelectionKey = NPFolder.key({folder: folder});
      }
    },
    hideModal () {
      this.folderSelectionKey = '';
      this.item = {};
      this.$refs.moveToFolderModalRef.hide();
    },
    onFolderSelected: function (folder) {
      if (this.item !== null) {
        if (this.item instanceof NPEntry) {
          this.item.folder = folder;
          this.$emit('moveEntryFolderSelected', this.item);
        } else if (this.item instanceof NPFolder) {
          this.item.parent = folder;
          this.$emit('newParentSelected', this.item);
        }
      } else {
        this.$emit('bulkMoveFolderSelected', folder);
      }
      this.$refs.moveToFolderModalRef.hide();
    }
  }
}
</script>

<style>
</style>
