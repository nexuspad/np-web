<template>
  <div>
    <h1>{{ bookmarkObj.title }}</h1>
    <div>
      <ul class="list-inline">
        <li v-for="tag in bookmarkObj.tags" :key="tag" class="list-inline-item">
          <span class="badge badge-info">{{ tag }}</span>
        </li>
      </ul>
      <div>
        <a target="_blank" :href="bookmarkObj.webAddress">{{ bookmarkObj.webAddress }}</a>
      </div>
      <div class="row" v-if="bookmarkObj.note">
        <span style="white-space: pre;">{{ bookmarkObj.note }}</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BookmarkDetail',
  props: ['bookmarkObj']
};
</script> 