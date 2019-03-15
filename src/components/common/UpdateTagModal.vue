<template>
  <b-modal ref="myModalRef" size="md" hide-footer :title=entry.title>
    <label-input :initialValues="entry.tags" @labelUpdated="updateTags" />
  </b-modal>
</template>

<script>
import LabelInput from './LabelInput';
import EntryService from '../../core/service/EntryService';
import EventManager from '../../core/util/EventManager';

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
  methods: {
    showModal (entry) {
      this.entry = entry;
      this.$refs.myModalRef.show();
    },
    hideModal () {
      this.$refs.myModalRef.hide();
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
