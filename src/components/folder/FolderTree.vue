<template>
  <div v-if="isLoaded">
    <ul class="list-unstyled">
      <folder-tree-node :key="usage" :usage="usage" :folder-obj="treeData" :folder-selection-key=folderSelectionKey
        :show-all-sub-folders="showAllSubfolders" v-on:folderSelected="onFolderSelectedInTree" />
    </ul>
  </div>
</template>

<script>
import FolderTreeNode from './FolderTreeNode';
import NPFolder from '../../core/datamodel/NPFolder';
import AppRoute from '../AppRoute';
import AppEvent from '../../core/util/AppEvent.js';
import EventManager from '../../core/util/EventManager';
import AccountService from '../../core/service/AccountService';
import FolderService from '../../core/service/FolderService';

export default {
  name: 'FolderTree',
  props: ['moduleId', 'activeFolderKey', 'ownerId', 'usage'],
  components: {
    FolderTreeNode
  },
  data () {
    return {
      isLoaded: false,
      folderSelectionKey: this.activeFolderKey,
      treeData: {}
    };
  },
  beforeMount () {
    if (this.usage === 'move') {
      this.showAllSubfolders = true;
    } else {
      this.showAllSubfolders = false;
    }
  },
  mounted () {
    if (!this.moduleId) {
      return;
    }
    this.loadTree(this.moduleId);
    EventManager.subscribe(AppEvent.FOLDER_RELOAD_EVENT, this.onFolderReloadEvent);
  },
  beforeDestroy () {
    EventManager.unSubscribe(AppEvent.FOLDER_RELOAD_EVENT, this.onFolderReloadEvent);
  },
  methods: {
    loadTree: function (moduleId) {
      if (!moduleId) {
        return;
      }
      let componentSelf = this;
      AccountService.hello()
        .then(function () {
          FolderService.getAllFolders(moduleId)
            .then(function (folderTree) {
              componentSelf.treeData = folderTree;
              componentSelf.isLoaded = true;
            })
            .catch(function (error) {
              console.log(error);
            });
        })
        .catch(function (error) {
          console.log(error);
        });
    },
    onFolderSelectedInTree: function (folder) {
      if (folder.folderId === 0) {
        folder = NPFolder.of(folder.moduleId, NPFolder.ROOT);
      }

      this.folderSelectionKey = NPFolder.key({folder: folder});

      if (this.usage === 'move') {
        this.$emit('folderSelected', folder);
      } else if (this.usage === 'editor') {
        EventManager.publishAppEvent(AppEvent.ofSuccess(AppEvent.ENTRY_MOVE, folder));
      } else {
        this.$router.push({name: AppRoute.folderRouteName(folder), params: {folderId: folder.folderId}});
      }
    },
    onFolderReloadEvent: function () {
      // reload the folder tree
      this.loadTree(this.moduleId);
    }
  },
  watch: {
    moduleId: function () {
      this.loadTree(this.moduleId);
    },
    activeFolderKey: function (value) {
      this.folderSelectionKey = value;
    }
  }
};
</script>

<style>
</style>
