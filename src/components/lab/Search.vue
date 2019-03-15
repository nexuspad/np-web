<template>
  <div>
    <FolderTree :moduleId="moduleId" />
    <SearchBox :moduleId="moduleId" :keyword="keyword" />
    <SearchResult :moduleId="moduleId" :keyword="keyword" />
  </div>
</template>

<script>
import FolderTree from '../folder/FolderTree';
import SearchBox from './SearchBox'
import SearchResult from './SearchResult'

export default {
  name: 'Search',
  props: ['moduleId'],
  data () {
    return { keyword: this.$route.query.keyword };
  },
  components: {
    FolderTree, SearchBox, SearchResult
  }
};
</script>