<template>
  <div class="modal" ref="uploaderModalRef">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">{{ title() }}</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <uploader :folder="folder" :entry="entry" v-on:closeUploadModal="hideUploader()" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Uploader from './Uploader';
import EntryActionProvider from '../common/EntryActionProvider.js';
import FolderActionProvider from '../common/FolderActionProvider.js';
import ContentHelper from '../../core/service/ContentHelper';
import { Modal } from 'bootstrap';

export default {
  name: 'UploaderModal',
  mixins: [ EntryActionProvider, FolderActionProvider ],
  data () {
    return {
      folder: null,
      entry: null,
      okToHide: false,
      modal: null
    };
  },
  components: {
    Uploader
  },
  computed: {
  },
  mounted () {
    this.modal = new Modal(this.$refs.uploaderModalRef)
    let me = this
    this.$refs.uploaderModalRef.addEventListener('hidden.bs.modal', function (event) {
      me.checkBeforeHideIt(event)
    })
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
      this.modal.show()
    },
    hideUploader () {
      this.okToHide = true;
      this.modal.hide()
    },
    checkBeforeHideIt (event) {
      if (!this.okToHide) {
        event.preventDefault();
      }
    }
  }
}
</script>