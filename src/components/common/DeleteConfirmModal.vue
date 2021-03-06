<template>
  <b-modal ref="deleteConfirmModalRef" :title="npContent('confirm deletion')">
    <div class="h6">{{ itemTitle }}</div>
    <div v-if="isEventAndRecurring()">
      <div class="custom-control custom-radio">
        <input type="radio" id="customRadio1" name="eventDeleteOption" class="custom-control-input" value="0" v-model="eventDeleteOption">
        <label class="custom-control-label" for="customRadio1">{{npContent('delete all recurring events')}}</label>
      </div>
      <div class="custom-control custom-radio">
        <input type="radio" id="customRadio2" name="eventDeleteOption" class="custom-control-input" value="1" v-model="eventDeleteOption">
        <label class="custom-control-label" for="customRadio2">{{npContent('delete this occurrence only')}}</label>
      </div>
      <div class="custom-control custom-radio">
        <input type="radio" id="customRadio3" name="eventDeleteOption" class="custom-control-input" value="2" v-model="eventDeleteOption">
        <label class="custom-control-label" for="customRadio3">{{npContent('delete this and all future one(s)')}}</label>
      </div>
    </div>
    <div slot="modal-footer">
      <b-btn variant="secondary" @click="hideModal">{{npContent('cancel')}}</b-btn>
      <b-btn variant="danger" @click="handleDelete">{{npContent('delete')}}</b-btn>
    </div>
  </b-modal>
</template>

<script>
import EntryActionProvider from '../common/EntryActionProvider.js';
import FolderActionProvider from '../common/FolderActionProvider.js';
import NPEntry from '../../core/datamodel/NPEntry.js';
import NPFolder from '../../core/datamodel/NPFolder.js';
import BulkOperation from '../../core/datamodel/BulkOperation.js';
import NPEvent from '../../core/datamodel/NPEvent.js';
import SiteProvider from './SiteProvider';

export default {
  name: 'DeleteConfirmModal',
  mixins: [ EntryActionProvider, FolderActionProvider, SiteProvider ],
  data () {
    return {
      item: Object,
      itemTitle: '',
      eventDeleteOption: false
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

        if (this.isEventAndRecurring()) {
          this.eventDeleteOption = 0;
        }
      }
      this.$refs.deleteConfirmModalRef.show();
    },
    setTitle () {
      if (this.item instanceof NPEntry) {
        this.itemTitle = this.item.title;
      } else if (this.item instanceof NPFolder) {
        this.itemTitle = this.item.folderName;
      } else if (this.item instanceof BulkOperation) {
        this.itemTitle = 'selected entries will be deleted';
      }
    },
    hideModal () {
      this.$refs.deleteConfirmModalRef.hide();
    },
    isEventAndRecurring () {
      if (this.item instanceof NPEvent && this.item.recurring) {
        return true;
      }
      return false;
    },
    handleDelete () {
      let componentSelf = this;
      if (this.item) {
        if (this.item instanceof NPEntry) {
          if (this.item instanceof NPEvent) {
            this.$emit('deleteEntryConfirmed', {entry: this.item, updateOption: componentSelf.eventDeleteOption});
          } else {
            this.$emit('deleteEntryConfirmed', {entry: this.item, updateOption: false});
          }
          componentSelf.hideModal();
        } else if (this.item instanceof NPFolder) {
          this.$emit('deleteFolderConfirmed', this.item);
          componentSelf.hideModal();
        } else if (this.item instanceof BulkOperation) {
          this.$emit('bulkDeleteConfirmed', this.item);
          componentSelf.hideModal();
        }
      }
    }
  }
}
</script>