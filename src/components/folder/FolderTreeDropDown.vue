<template>
  <div>
    <h2>Dropdown folder tree</h2>
    <b-dropdown id="ddown1" text="Dropdown Button" class="m-md-2">
      <b-dropdown-item>First Action</b-dropdown-item>
      <b-dropdown-item>Second Action</b-dropdown-item>
      <b-dropdown-item>Third Action</b-dropdown-item>
      <b-dropdown-divider></b-dropdown-divider>
      <b-dropdown-item>Something else here...</b-dropdown-item>
      <b-dropdown-item disabled>Disabled action</b-dropdown-item>
      <folder-tree :moduleId="3" @folderSelected="onFolderSelected" />
    </b-dropdown>
  </div>
</template>

<script>
import FolderTree from '../folder/FolderTree';

export default {
  name: 'FolderTreeDropDown',
  components: {
    FolderTree
  },
  methods: {
    onFolderSelected: function (folder) {
      this.$emit('folderSelected', folder);
    }
  }
}
</script>
