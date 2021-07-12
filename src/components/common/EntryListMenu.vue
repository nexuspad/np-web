<template>
  <div class="input-group">
    <button class="btn btn-light dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
      <i class="fas fa-ellipsis-h"></i>
    </button>
    <ul class="dropdown-menu">
      <li>
        <a class="dropdown-item" @click="togglePin(entry)" v-if="actionIsAvailable('pin', entry)">
          <i class="fa-star mr-1" v-bind:class="{fas:entry.pinned, far:!entry.pinned}"></i>
          <span v-if="!entry.pinned">{{npContent('favorite')}}</span>
          <span v-if="entry.pinned">{{npContent('unfavorite')}}</span>
        </a>
      </li>
      <li>
        <a class="dropdown-item" @click="openUpdateTagModal(entry)" v-if="actionIsAvailable('tags', entry)">
          <i class="fa fa-tags mr-1"></i>{{npContent('tags')}}
        </a>
      </li>
      <li>
        <a class="dropdown-item" @click="goEntryRoute(entry, 'edit', folder)" v-if="actionIsAvailable('edit', entry)">
          <i class="far fa-edit mr-1"></i>{{npContent('update')}}
        </a>
      </li>
      <li>
        <a class="dropdown-item text-danger" @click="openFolderTreeModal(entry)" v-if="actionIsAvailable('move', entry)">
          <i class="far fa-folder-open mr-1"></i>{{npContent('move')}}
        </a>
      </li>
      <li>
        <a class="dropdown-item unstyled" :href="entry.downloadLink" target="_blank" download v-if="actionIsAvailable('download', entry)">
          <i class="fas fa-download mr-1"></i>{{npContent('download')}}
        </a>
      </li>
      <li>
        <a class="dropdown-item" @click="openDeleteConfirmModel(entry)" v-if="actionIsAvailable('delete', entry)">
          <i class="far fa-trash-alt mr-1"></i>{{npContent('delete')}}
        </a>
      </li>
    </ul>
  </div>
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
