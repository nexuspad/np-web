<template>
  <li>
    <div>
      <span v-if="folderObj.folderId === 0" @click="toggle()">
        <i class="fas fa-plus-square fa-fw" v-if="!showSubFolderNode"></i>
        <i class="fas fa-minus-square fa-fw" v-if="showSubFolderNode"></i>
      </span>
      <span v-if="folderObj.folderId !== 0 && hasSubFolder" @click="toggle()">
        <span v-html="expanderIcon(folderObj, showSubFolderNode)"/>
      </span>
      <span v-html="folderIcon(folderObj)" v-if="folderObj.folderId !== 0 && !hasSubFolder"></span>
      <a class="folder-name" @click="selectFolder(folderObj)" 
        v-bind:class="{'folder-selected': isFolderSelected, 'disabled':!canSelect(folderObj) && folderObj.folderId !== 0}">
        {{ folderObj.folderName }}
      </a>
    </div>
    <ul class="list-unstyled pl-3" v-show="showSubFolderNode" v-if="hasSubFolder">
      <folder-tree-node
        v-for="(folderObj, index) in folderObj.subFolders"
        :key="nodeKey(index)"
        :usage="usage"
        :folder-obj="folderObj"
        :folder-selection-key=folderSelectionKey
        :show-all-sub-folders="showAllSubFolders"
        v-on:folderSelected="onFolderSelected">
      </folder-tree-node>
    </ul>
  </li>
</template>

<script>
import NPFolder from '../../core/datamodel/NPFolder';
import PreferenceService from '../../core/service/PreferenceService';
import NPShareRoot from '../../core/datamodel/NPShareRoot';

export default {
  name: 'FolderTreeNode',
  props: ['usage', 'folderObj', 'folderSelectionKey', 'showAllSubFolders'],
  data: function () {
    return {
      showSubFolderNode: PreferenceService.getPreference().isFolderOpen(this.folderObj) || this.showAllSubFolders,
      isFolderSelected: false
    };
  },
  computed: {
    hasSubFolder: function () {
      return this.folderObj.subFolders && this.folderObj.subFolders.length;
    }
  },
  mounted () {
    this.markSelection();
  },
  methods: {
    nodeKey (index) {
      return this.usage + index;
    },
    markSelection () {
      if (this.folderSelectionKey == NPFolder.key({folder: this.folderObj})) {
        this.isFolderSelected = true;
      } else {
        this.isFolderSelected = false;
      }
    },
    toggle () {
      this.showSubFolderNode = !this.showSubFolderNode;
      PreferenceService.getPreference().toggleFolder(this.folderObj, this.showSubFolderNode);
      PreferenceService.updateViewPreference();
    },
    expanderIcon (folderObj, showSubFolderNode) {
      let colorLabel = folderObj.getColorLabel();
      if (showSubFolderNode) {
        if (colorLabel) {
          return '<i class="far fa-minus-square fa-fw" style="color:' + colorLabel + '"></i>';
        } else {
          return '<i class="far fa-minus-square fa-fw"></i>';
        }
      } else {
        if (colorLabel) {
          return '<i class="far fa-plus-square fa-fw" style="color:' + colorLabel + '"></i>';
        } else {
          return '<i class="far fa-plus-square fa-fw"></i>';
        }
      }
    },
    folderIcon (folderObj) {
      let colorLabel = folderObj.getColorLabel();
      if (colorLabel) {
        return '<i class="fa fa-folder fa-fw" style="color:' + colorLabel + '"></i>';
      } else {
        return '<i class="far fa-folder fa-fw"></i>';
      }
    },
    addChild () {
      this.folderObj.subFolders.push({
        folderName: 'new folder'
      });
    },
    canSelect (folder) {
      if (this.usage === 'sidenav') {
        if (folder instanceof NPShareRoot) {
          return false;
        }
        return true;
      } else if (this.usage === 'editor') {
        return folder.hasWritePermission();
      } else if (this.usage === 'move') {
        if (this.folderSelectionKey == NPFolder.key({folder: this.folderObj})) {
          return false;
        }
        return true;
      }
    },
    selectFolder (folder) {
      if (this.canSelect(folder)) {
        this.$emit('folderSelected', folder);
      }
    },
    onFolderSelected (folder) {   // Since tree-node is nested, the event can bubble.
      this.$emit('folderSelected', folder);
    },
    updateFolder (folder) {
      console.log('update folder', folder);
    }
  },
  watch: {
    'folderSelectionKey': function (value) {
      this.markSelection();
    }
  }
}
</script>

<style>
a.folder-name { font-size:smaller; }
i.fa-plus-square, i.fa-minus-square { cursor: pointer; }
a:hover { cursor:pointer; }
</style>
