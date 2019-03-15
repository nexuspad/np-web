<template>
  <div>
    <h1>Doc module</h1>
    <folder-tree :moduleId="moduleId" usage="blah" @folderSelected="onFolderSelected" />
    <doc-list />
  </div>
</template>

<script>
import FolderTree from '../folder/FolderTree';
import DocList from '../doc/DocList';
import NPModule from '../../core/datamodel/NPModule';
import NPFolder from '../../core/datamodel/NPFolder';

export default {
  name: 'DocDev',
  data () {
    return {
      moduleId: NPModule.DOC,
      folder: NPFolder.of(NPModule.DOC, NPFolder.ROOT)
    };
  },
  components: {
    FolderTree, DocList
  },
  mounted () {
    this.folder = NPFolder.of(NPModule.DOC, NPFolder.ROOT);
  },
  methods: {
    onFolderSelected: function (folder) {
      console.log('push folder route ', folder);
      this.$router.push({name: 'docFolder', params: {folderId: folder.folderId}});
    }
  }
};
</script>