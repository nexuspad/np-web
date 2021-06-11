<template>
  <div class="np-module-container">
    <split-panel>
      <template v-slot:left-pane>
        <side-navigation />
      </template>
      <template v-slot:right-pane>
        <router-view></router-view>
      </template>
    </split-panel>
  </div>
</template>

<script>
export default {
  name: 'Bookmark'
};
</script>