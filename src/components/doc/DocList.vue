<template>
  <div>
    <infinite-list :folder="folder" />
  </div>
</template>

<script>
import FolderActionProvider from '../common/FolderActionProvider.js';
import InfiniteList from '../common/InfiniteList';
import NPModule from '../../core/datamodel/NPModule';
import NPFolder from '../../core/datamodel/NPFolder';

export default {
  name: 'Doc',
  mixins: [ FolderActionProvider ],
  data () {
    return {
      moduleId: NPModule.DOC,
      folder: NPFolder.of(NPModule.DOC, NPFolder.UNASSIGNED)
    };
  },
  components: {
    InfiniteList
  },
  created () {
    this.locateRouteFolder(NPModule.DOC, this.$route.params);
  },
  beforeDestroy () {
  },
  methods: {
  },
  watch: {
    '$route.params': function () {
      this.locateRouteFolder(NPModule.DOC, this.$route.params);
    }
  }
};
</script>