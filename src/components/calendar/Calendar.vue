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
  name: 'Calendar',
  components: {
  },
  data () {
    return {
    }
  },
  computed: {
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