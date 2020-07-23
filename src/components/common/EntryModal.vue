<template>
  <div>
    <b-modal ref="entryModalRef" size="lg" :title="entryObj.title" @hide="onDismiss">
      <b-container fluid>
      </b-container>
      <div slot="modal-footer" class="w-100" v-if="entryObj.entryId">
        <entry-menu :entry="entryObj" />
      </div>
    </b-modal>
  </div>
</template>

<script>
import EntryMenu from './EntryMenu';
import EntryActionProvider from './EntryActionProvider';
import NPEntry from '../../core/datamodel/NPEntry';

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
  methods: {
    showModal (entryObj) {
      this.entryObj = entryObj;
      this.$refs.entryModalRef.show();
    },
    hideModal () {
      this.$refs.entryModalRef.hide();
    },
    onDismiss () {
      // event.preventDefault();
    }
  }
}
</script>

<style>
</style>
