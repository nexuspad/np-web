<template>
  <div>
    <h1>Calendar module</h1>
    <folder-tree :moduleId="moduleId" @folderSelected="onFolderSelected" />
    <h2>full-calendar lib</h2>
    <calendar-views/>
  </div>
</template>

<script>
import FolderTree from '../folder/FolderTree';
import CalendarViews from '../calendar/CalendarViews';
import NPModule from '../../core/datamodel/NPModule';
import NPFolder from '../../core/datamodel/NPFolder';

export default {
  name: 'CalendarDev',
  data () {
    return {
      moduleId: NPModule.CALENDAR,
      folder: NPFolder.of(NPModule.CALENDAR, NPFolder.ROOT)
    };
  },
  components: {
    FolderTree, CalendarViews
  },
  mounted () {
    this.folder = NPFolder.of(NPModule.CALENDAR, NPFolder.ROOT);
  },
  methods: {
    onFolderSelected: function (folder) {
      // console.log('push folder route ', folder);
      // this.$router.push({name: 'bookmarkFolder', params: {folderId: folder.folderId}});
    }
  }
};
</script>