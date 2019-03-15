<template>
  <div>
    <h1>Bookmark module</h1>
    <h2>side navigation</h2>
    <side-navigation />
    <h2>list - infinity scrolling</h2>
    <bookmark-list/>
  </div>
</template>

<script>
import SideNavigation from '../layout/SideNavigation';
import BookmarkList from '../bookmark/BookmarkList';
import NPModule from '../../core/datamodel/NPModule';
import NPFolder from '../../core/datamodel/NPFolder';

export default {
  name: 'BookmarkDev',
  data () {
    return {
      moduleId: NPModule.BOOKMARK,
      folder: NPFolder.of(NPModule.BOOKMARK, NPFolder.ROOT)
    };
  },
  components: {
    SideNavigation, BookmarkList
  },
  mounted () {
    this.folder = NPFolder.of(NPModule.BOOKMARK, NPFolder.ROOT);
  },
  methods: {
    onFolderSelected: function (folder) {
      // console.log('push folder route ', folder);
      // this.$router.push({name: 'bookmarkFolder', params: {folderId: folder.folderId}});
    }
  }
};
</script>