<template>
  <div>
    <h1>Contact module</h1>
    <folder-tree :moduleId="moduleId" @folderSelected="onFolderSelected" />
    <contact-list />
  </div>
</template>

<script>
import FolderTree from '../folder/FolderTree';
import ContactList from '../contact/ContactList';
import NPModule from '../../core/datamodel/NPModule';
import NPFolder from '../../core/datamodel/NPFolder';

export default {
  name: 'ContactDev',
  data () {
    return {
      moduleId: NPModule.CONTACT,
      folder: NPFolder.of(NPModule.CONTACT, NPFolder.ROOT)
    };
  },
  components: {
    FolderTree, ContactList
  },
  mounted () {
    this.folder = NPFolder.of(NPModule.CONTACT, NPFolder.ROOT);
  },
  methods: {
    onFolderSelected: function (folder) {
      console.log('push folder route ', folder);
      this.$router.push({name: 'contactFolder', params: {folderId: folder.folderId}});
    }
  }
};
</script>