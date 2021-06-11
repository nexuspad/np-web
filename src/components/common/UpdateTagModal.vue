<template>
  <div class="modal" ref="tagUpdateModalRef">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">{{ entry.title }}</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <label-input :initialValues="entry.tags" @labelUpdated="updateTags" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import LabelInput from './LabelInput';
import EntryService from '../../core/service/EntryService';
import EventManager from '../../core/util/EventManager';
import { Modal } from 'bootstrap';

export default {
  name: 'UpdateTagModal',
  props: [],
  data () {
    return {
      entry: { tags: [] }
    };
  },
  components: {
    LabelInput
  },
  mounted () {
    this.modal = new Modal(this.$refs.tagUpdateModalRef)
  },
  methods: {
    showModal (entry) {
      this.entry = entry;
      this.modal.show();
    },
    hideModal () {
      this.modal.hide();
    },
    updateTags: function (tags) {
      this.entry.tags = tags;

      let componentSelf = this;
      EntryService.updateTag(this.entry)
        .then(function (entry) {
          componentSelf.entry = entry;
          EventManager.publish(EntryService.UPDATE, entry);
        })
        .catch(function (error) {
          console.log(error);
        });
    }
  }
}
</script>

<style>
</style>
