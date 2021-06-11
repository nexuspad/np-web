<template>
  <div class="modal" ref="entryModalRef">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">{{ entryObj.title }}</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
        </div>
        <div class="modal-footer">
          <entry-menu :entry="entryObj" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import EntryMenu from './EntryMenu';
import EntryActionProvider from './EntryActionProvider';
import NPEntry from '../../core/datamodel/NPEntry';
import { Modal } from 'bootstrap';

export default {
  name: 'EntryModal',
  mixins: [ EntryActionProvider ],
  components: {
    EntryMenu
  },
  data: function () {
    return {
      entryObj: new NPEntry()
    };
  },
  mounted () {
    this.modal = new Modal(this.$refs.entryModalRef)
    let me = this
    this.$refs.entryModalRef.addEventListener('hidden.bs.modal', function (event) {
      me.onDismiss(event)
    })
  },
  methods: {
    showModal (entryObj) {
      this.entryObj = entryObj;
      this.modal.show();
    },
    hideModal () {
      this.modal.hide();
    },
    onDismiss () {
      // event.preventDefault();
    }
  }
}
</script>

<style>
</style>
