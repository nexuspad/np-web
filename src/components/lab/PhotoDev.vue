<template>
  <div>
    <h1>Photo module</h1>
    <folder-tree :moduleId="moduleId" @folderSelected="onFolderSelected" />
    <album />
  </div>
</template>

<script>
import FolderTree from '../folder/FolderTree';
import Album from '../photo/Album';
import NPModule from '../../core/datamodel/NPModule';
import NPFolder from '../../core/datamodel/NPFolder';

export default {
  name: 'PhotoDev',
  data () {
    return {
      moduleId: NPModule.PHOTO,
      folder: NPFolder.of(NPModule.PHOTO, NPFolder.ROOT)
    };
  },
  components: {
    FolderTree, Album
  },
  mounted () {
    this.folder = NPFolder.of(NPModule.PHOTO, NPFolder.ROOT);
  },
  methods: {
    onFolderSelected: function (folder) {
      console.log('push folder route ', folder);
      this.$router.push({name: 'photoFolder', params: {folderId: folder.folderId}});
    }
  }
};
</script>