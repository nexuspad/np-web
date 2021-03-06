<template>
  <div v-if="isLoaded">
    <ul class="list-unstyled" v-for="(folderObj, index) in treeData" v-bind:key="index">
      <folder-tree-node :key="usage" :usage="usage" :folder-obj="folderObj" :folder-selection-key=folderSelectionKey
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
import SharedFolderService from '../../core/service/SharedFolderService';

export default {
  name: 'SharedFolderTree',
  props: ['moduleId', 'activeFolderKey', 'usage'],
  components: {
    FolderTreeNode
  },
  data () {
    return {
      folderSelectionKey: this.activeFolderKey,
      isLoaded: false,
      treeData: []
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
    EventManager.subscribe(AppEvent.SHARED_FOLDER_RELOAD_EVENT, this.onFolderReloadEvent);
  },
  beforeDestroy () {
    EventManager.unSubscribe(AppEvent.SHARED_FOLDER_RELOAD_EVENT, this.onFolderReloadEvent);
  },
  methods: {
    loadTree: function (moduleId, refresh = false) {
      if (!moduleId) {
        return;
      }

      while (this.treeData.length > 0) {
        this.treeData.pop();
      }

      let componentSelf = this;
      AccountService.hello()
        .then(function () {
          SharedFolderService.getAllFolders(moduleId, refresh)
            .then(function (folderTreeByUsers) {
              folderTreeByUsers.forEach((folderTree) => {
                componentSelf.treeData.push(folderTree);
              });
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
      this.folderSelectionKey = NPFolder.key({folder: folder});

      if (this.usage === 'move') {
        this.$emit('folderSelected', folder);
      } else if (this.usage === 'editor') {
        EventManager.publishAppEvent(AppEvent.ofSuccess(AppEvent.ENTRY_MOVE, folder));
      } else {
        this.$router.push({name: AppRoute.sharedFolderRouteName(folder), params: {user: folder.getOwnerId(), folderId: folder.folderId}});
      }
    },
    onFolderReloadEvent: function () {
      // reload the folder tree
      console.log('reload shared folders');
      this.loadTree(this.moduleId, true);
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
