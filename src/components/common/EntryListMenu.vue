<template>
  <b-dropdown right variant="link" no-caret>
    <template slot="button-content">
      <i class="fas fa-ellipsis-h"></i>
    </template>
    <b-dropdown-item @click="togglePin(entry)" v-if="actionIsAvailable('pin', entry)">
      <i class="fa-star mr-1" v-bind:class="{fas:entry.pinned, far:!entry.pinned}"></i>
      <span v-if="!entry.pinned">{{npContent('favorite')}}</span>
      <span v-if="entry.pinned">{{npContent('unfavorite')}}</span>
    </b-dropdown-item>
    <b-dropdown-item @click="openUpdateTagModal(entry)" v-if="actionIsAvailable('tags', entry)">
      <i class="fa fa-tags mr-1"></i>{{npContent('tags')}}
    </b-dropdown-item>
    <b-dropdown-item @click="goEntryRoute(entry, 'edit', folder)" v-if="actionIsAvailable('edit', entry)">
      <i class="far fa-edit mr-1"></i>{{npContent('update')}}
    </b-dropdown-item>
    <b-dropdown-item @click="openFolderTreeModal(entry)" v-if="actionIsAvailable('move', entry)">
      <i class="far fa-folder-open mr-1"></i>{{npContent('move')}}
    </b-dropdown-item>
    <b-dropdown-item v-if="actionIsAvailable('download', entry)">
      <a class="unstyled" :href="entry.downloadLink" target="_blank" download>
        <i class="fas fa-download mr-1"></i>{{npContent('download')}}
      </a>
    </b-dropdown-item>
    <b-dropdown-item @click="openDeleteConfirmModel(entry)" class="text-danger" v-if="actionIsAvailable('delete', entry)">
      <i class="far fa-trash-alt mr-1"></i>{{npContent('delete')}}
    </b-dropdown-item>
  </b-dropdown>
</template>

<script>
import EntryActionProvider from './EntryActionProvider';
import SiteProvider from './SiteProvider';

export default {
  name: 'EntryListMenu',
  mixins: [ EntryActionProvider, SiteProvider ],
  props: ['folder', 'entry'],
  methods: {
    openUpdateTagModal(entry) {
      this.$emit('openUpdateTagModal', entry);
    },
    openFolderTreeModal(entry) {
      this.$emit('openFolderTreeModal', entry);
    },
    openDeleteConfirmModel(entry) {
      this.$emit('openDeleteConfirmModel', entry);
    }
  }
}
</script>
