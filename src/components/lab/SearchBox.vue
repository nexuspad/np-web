<template>
  <div>
    <input type="text" name="keyword" v-model="keyword" />
    <div>
      <router-link :to="'/search/contact?keyword=' + keyword">Search contact</router-link>&nbsp;
      <router-link :to="'/search/doc?keyword=' + keyword">Search doc</router-link>&nbsp;
      <router-link to="/search/bookmark">Search bookmark</router-link>&nbsp;
    </div>
  </div>
</template>

<script>
export default {
  name: 'SearchBox',
  props: ['moduleId', 'keyword'],
  mounted () {
  },
  watch: {
    keyword: function (newVal, oldVal) {
    }
  }
};
</script>