<template>
  <div class="card">
    <h1 class="card-header">{{ bookmarkObj.title }}</h1>
    <div class="card-body">
      <ul class="list-inline">
        <li v-for="tag in bookmarkObj.tags" :key="tag" class="list-inline-item">
          <span class="badge badge-info">{{ tag }}</span>
        </li>
      </ul>
      <div>
        <a target="_blank" :href="bookmarkObj.webAddress">{{ bookmarkObj.webAddress }}</a>
      </div>
    </div>
    <div class="card-footer" v-if="bookmarkObj.note">
      <span style="white-space: pre;">{{ bookmarkObj.note }}</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BookmarkDetail',
  props: ['bookmarkObj']
};
</script> 