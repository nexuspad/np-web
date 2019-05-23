<template>
  <b-modal ref="stopSharingConfirmModalRef" title="confirm sharing change">
    <div class="h6">{{ itemTitle }}</div>
    <div>{{npContent('will not longer be shared to you')}}</div>
    <div slot="modal-footer">
      <b-btn variant="secondary" @click="hideModal">{{npContent('cancel')}}</b-btn>
      <b-btn variant="danger" @click="confirmed">{{npContent('confirm')}}</b-btn>
    </div>
  </b-modal>
</template>

<script>
import FolderActionProvider from '../common/FolderActionProvider.js';
import NPFolder from '../../core/datamodel/NPFolder.js';
import SiteProvider from './SiteProvider';

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
  },
  methods: {
    showModal (item) {
      if (item) {
        this.item = item;
        this.setTitle();
      }
      this.$refs.stopSharingConfirmModalRef.show();
    },
    setTitle () {
      this.itemTitle = this.item.folderName;
    },
    hideModal () {
      this.$refs.stopSharingConfirmModalRef.hide();
    },
    confirmed () {
      this.$emit('stopSharingConfirmed', this.item);
      this.hideModal();
    }
  }
}
</script>