<template>
  <div class="np-module-container">
    <split-panel>
      <div slot="left-pane">
        <side-navigation />
      </div>
      <div slot="right-pane">
        <router-view class="view"></router-view>
      </div>
    </split-panel>
  </div>
</template>

<script>
export default {
  name: 'Bookmark',
  data () {
    return {
    };
  },
  components: {
  },
  mounted () {
  },
  beforeDestroy () {
  },
  methods: {
  },
  watch: {
  }
};
</script>