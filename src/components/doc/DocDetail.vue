<template>
  <div class="card">
    <delete-confirm-modal ref="deleteConfirmModalRef" @deleteEntryConfirmed="deleteAttachment" />
    <h1 class="card-header" v-show="!editTitle">{{ docObj.title }}
      <!-- edit title doesn't seem to be useful
      <button type="button" class="icon-button" @click="editTitle = !editTitle"><i class="fa fa-edit"></i></button>
      -->
    </h1>
    <div class="row form-group mt-2" v-show="editTitle">
      <div class="col">
        <input type="text" class="form-control input-underline" v-model="docObj.title" />
      </div>
      <div class="col-md-auto">
        <b-button-group>
          <b-button variant="primary" @click="updateTitle(docObj)"><i class="fa fa-check"></i></b-button>
        </b-button-group>
      </div>
    </div>
    <div class="card-body">
      <ul class="list-inline">
        <li v-for="tag in docObj.tags" :key="tag" class="list-inline-item">
          <span class="badge badge-info">{{ tag }}</span>
        </li>
      </ul>
      <span v-html="htmlNote" v-if="isHtml()"></span>
      <span style="white-space: pre-wrap;" v-if="isPlainText()">{{ docObj.note }}</span>
    </div>
    <ul class="list-group mt-4">
      <li class="list-unstyled" v-for="item in attachments" v-bind:key="item.entryId">
        <div class="row mt-2 mb-2">
          <div class="col">
            <i class="far fa-file mr-2" v-if="!item.isImage()"></i>
            <button type="button" class="icon-button" v-if="item.isImage() && !item.showImage" @click="item.showImage = true">
              <i class="fas fa-angle-double-down mr-2"></i>
            </button>
            <button type="button" class="icon-button" v-if="item.isImage() && item.showImage" @click="item.showImage = false">
              <i class="fas fa-angle-double-up mr-2"></i>
            </button>
            <a :href="item.viewLink" target="_blank">{{ item.fileName }}</a>
          </div>
          <div class="col-md-auto">
            <span class="mr-4">
              <button type="button" class="btn btn-outline-primary btn-sm"
                v-on:click="showLink(item)">link</button>
            </span>
            <span class="mr-4">
              <a :href="item.downloadLink"><i class="fas fa-download"></i></a>
            </span>
            <button type="button" class="icon-button" @click="openDeleteConfirmModel(item)" v-if="docObj.isMine()">
              <i class="fas fa-trash np-danger"></i>
            </button>
          </div>
        </div>
        <div class="row" v-if="item.showLink">
          <div class="col">
            <textarea v-model="item.viewLink" class="form-control" readonly></textarea>
          </div>
        </div>
        <div class="row" v-if="item.showImage">
          <div class="col">
            <span v-if="item.isLoading">opening...</span>
            <img :src="item.viewLink" @load="item.isLoading = false" />
          </div>
        </div>
        <div class="row border-bottom mt-2"></div>
      </li>
    </ul>
  </div>
</template>

<script>
import DeleteConfirmModal from '../common/DeleteConfirmModal';
import EntryActionProvider from '../common/EntryActionProvider';
import AccountService from '../../core/service/AccountService';
import EntryService from '../../core/service/EntryService';

export default {
  name: 'DocDetail',
  props: ['docObj'],
  mixins: [ EntryActionProvider ],
  data: function () {
    return {
      editTitle: false,
      attachments: []
    };
  },
  components: {
    DeleteConfirmModal
  },
  computed: {
    htmlNote () {
      if (this.docObj.format === 'HTML') {
        return this.docObj.note;
      } else {
        if (this.docObj.note) {
          return this.docObj.note.replace(/(\r\n|\n|\r)/gm, '<br/>');
        }
      }
    }
  },
  mounted () {
    this.reloadDoc();
    // this.updateWeight(this.docObj);
  },
  beforeDestroy () {
  },
  methods: {
    isHtml () {
      return this.docObj.format === 'HTML';
    },
    isPlainText () {
      return this.docObj.format === 'TEXT';
    },
    isMD () {
      return this.docObj.format === 'MD';
    },
    reloadDoc () {
      let componentSelf = this;
      AccountService.hello()
      .then(function () {
        EntryService.get(componentSelf.docObj, true)
        .then(function (doc) {
          componentSelf._updateAttachments(doc);
        })
        .catch(function (error) {
          console.log('Error getting doc detail', error);
        });
      })
      .catch(function (error) {
        console.log(error);
      });
    },
    deleteAttachment ({entry: uploadEntry}) {
      let componentSelf = this;
      AccountService.hello()
      .then(function () {
        EntryService.deleteAttachment(uploadEntry.entryId, componentSelf.docObj)
        .then(function (updatedDoc) {
          componentSelf._updateAttachments(updatedDoc);
        })
        .catch(function (error) {
          console.log('Error deleting attachment', error);
        });
      })
      .catch(function (error) {
        console.log(error);
      });
    },
    _updateAttachments (doc) {
      doc.attachments.forEach((item) => {
        item.showLink = false;
        item.showImage = false;
      });
      while (this.attachments.length) {
        this.attachments.pop();
      }
      if (doc.attachments && doc.attachments.length > 0) {
        this.attachments.push(...doc.attachments);
      }
    },
    showLink (item) {
      item.showLink = !item.showLink;
    }
  },
  watch: {
    // watch the change of the doc object.
    // use case: after attaching a file, the attachment list needs to be updated on the page.
    'docObj': function (newDocObj) {
      this._updateAttachments(this.docObj);
    }
  },
};
</script>

<style scoped>
i.fa-edit { font-size: 60% !important; }
img { max-width: 100%; max-height: 100%; }
</style>