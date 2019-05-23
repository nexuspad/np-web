<template>
  <b-modal ref="uploaderModalRef" hide-footer size="lg" :title="title()" hide-header-close  @hide="checkBeforeHideIt($event)">
    <uploader :folder="folder" :entry="entry" v-on:closeUploadModal="hideUploader()" />
  </b-modal>
</template>

<script>
import Uploader from './Uploader';
import EntryActionProvider from '../common/EntryActionProvider.js';
import FolderActionProvider from '../common/FolderActionProvider.js';
import ContentHelper from '../../core/service/ContentHelper';

export default {
  name: 'UploaderModal',
  mixins: [ EntryActionProvider, FolderActionProvider ],
  data () {
    return {
      folder: null,
      entry: null,
      okToHide: false
    };
  },
  components: {
    Uploader
  },
  computed: {
  },
  mounted () {
  },
  methods: {
    title () {
      let title = ContentHelper.translate('upload to') + ' ';
      
      if (this.entry) {
        return title + this.entry.title;
      } else if (this.folder) {
        if (this.folder.folderId != 0) {
          return title + this.folder.getName();
        } else {
          return title + ContentHelper.translate('root folder');
        }
      }
    },
    showUploader ({folder = null, entry = null}) {
      this.folder = folder;
      this.entry = entry;
      this.$refs.uploaderModalRef.show();
    },
    hideUploader () {
      this.okToHide = true;
      this.$refs.uploaderModalRef.hide();
    },
    checkBeforeHideIt (event) {
      if (!this.okToHide) {
        event.preventDefault();
      }
    }
  }
}
</script>