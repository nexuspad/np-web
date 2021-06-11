<template>
  <div>
    <infinite-list :folder="folder" v-if="!$route.query.page" />
    <list :folder="folder" :pageId="$route.query.page" :entryList="false" v-if="$route.query.page" />
  </div>
</template>

<script>
import InfiniteList from '../common/InfiniteList';
import List from '../common/List';
import FolderActionProvider from '../common/FolderActionProvider.js';
import NPModule from '../../core/datamodel/NPModule';
import NPFolder from '../../core/datamodel/NPFolder';

export default {
  name: 'BookmarkList',
  mixins: [ FolderActionProvider ],
  data () {
    return {
      moduleId: NPModule.BOOKMARK,
      folder: NPFolder.of(NPModule.BOOKMARK, NPFolder.UNASSIGNED)
    };
  },
  components: {
    InfiniteList, List
  },
  beforeMount () {
    this.locateRouteFolder(NPModule.BOOKMARK, this.$route.params);
  },
  watch: {
    '$route.params': function () {
      this.locateRouteFolder(NPModule.BOOKMARK, this.$route.params);
    }
  }
};
</script>