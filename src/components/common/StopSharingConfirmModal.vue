<template>
  <div class="modal" ref="stopSharingConfirmModalRef">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">{{ npContent('confirm sharing change') }}</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          {{npContent('will not longer be shared to you')}}
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="hideModal">{{npContent('cancel')}}</button>
          <button type="button" class="btn btn-primary" @click="confirmed">{{npContent('confirm')}}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import FolderActionProvider from '../common/FolderActionProvider.js';
import SiteProvider from './SiteProvider';
import { Modal } from 'bootstrap';

export default {
  name: 'StopSharingConfirmModal',
  mixins: [ FolderActionProvider, SiteProvider ],
  data () {
    return {
      item: Object,
      itemTitle: ''
    };
  },
  components: {
  },
  computed: {
  },
  mounted () {
    this.setTitle();
    this.modal = new Modal(this.$refs.stopSharingConfirmModalRef)
  },
  methods: {
    showModal (item) {
      if (item) {
        this.item = item;
        this.setTitle();
      }
      this.modal.show();
    },
    setTitle () {
      this.itemTitle = this.item.folderName;
    },
    hideModal () {
      this.modal.hide();
    },
    confirmed () {
      this.$emit('stopSharingConfirmed', this.item);
      this.hideModal();
    }
  }
}
</script>