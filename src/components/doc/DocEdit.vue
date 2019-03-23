<template>
  <div>
    <div class="row form-group">
      <div class="col">
        <input type="text" class="form-control input-underline" placeholder="title (optional)" v-model="doc.title" />
      </div>
      <div class="col-md-auto align-bottom">
        <button type="button" class="icon-button" @click="showTagForm=!showTagForm">
          <i class="fas fa-tags text-primary"></i>
        </button>
      </div>
    </div>
    <div class="row form-group" v-show="showTagForm">
      <div class="col">
        <label-input ref="tagInput" :initialValues="doc.tags" />
      </div>
    </div>
    <div class="row">
      <div class="col" v-if="doc.format === 'TEXT'">
        <textarea-autosize class="form-control" placeholder="notes" :min-height="editorHeight()" v-model="doc.note"></textarea-autosize>
      </div>
      <div class="col" v-show="doc.format === 'HTML'">
        <textarea id="DocCKEditor"></textarea>
      </div>
    </div>
    <b-navbar toggleable="md" fixed="top" type="dark" variant="dark">
      <b-collapse is-nav id="editor_nav_menu_collapse">
        <b-navbar-nav>
          <b-nav-text class="mr-2"><message :location="'TOP_NAVBAR'" /></b-nav-text>
          <b-nav-text v-if="!doc.entryId">new doc</b-nav-text>
          <b-nav-text v-if="doc.entryId">edit doc</b-nav-text>
        </b-navbar-nav>
        <b-navbar-nav v-if="doc.format === 'TEXT'">
          <b-dropdown :text="docFormat()" class="ml-4" size="sm">
            <b-dropdown-item v-if="doc.format !== 'HTML'" @click="switchFormat('HTML')">{{ docFormat('HTML') }}</b-dropdown-item>
            <!--
            <b-dropdown-item v-if="doc.format !== 'TEXT'" @click="switchFormat('TEXT')">{{ docFormat('TEXT') }}</b-dropdown-item>
            <b-dropdown-item v-if="doc.format !== 'MD'" @click="switchFormat('MD')">{{ docFormat('MD') }}</b-dropdown-item>
            -->
          </b-dropdown>
        </b-navbar-nav>
        <!-- right aligned nav items -->
        <b-navbar-nav class="ml-auto">
          <b-button-group class="mx-1">
            <button class="btn btn-primary" v-on:click="collectTags(); save($event, doc)">save</button>
          </b-button-group>
          <b-button-group class="mx-1">
            <b-button class="my-2 my-sm-0" type="button" v-on:click="cancel()">close</b-button>
          </b-button-group>
        </b-navbar-nav>
      </b-collapse>
    </b-navbar>
  </div>
</template>

<script>
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import CKEditorUploadAdapter from '../../core/util/CKEditorUploadAdapter.js';
import LabelInput from '../common/LabelInput';
import NPEntry from '../../core/datamodel/NPEntry';
import AccountService from '../../core/service/AccountService';
import EntryService from '../../core/service/EntryService';
import NPModule from '../../core/datamodel/NPModule';
import NPDoc from '../../core/datamodel/NPDoc';
import AutoSaver from '../../core/util/AutoSaver';
import Message from '../common/Message';
import EntryActionProvider from '../common/EntryActionProvider';
import EventManager from '../../core/util/EventManager';
import AppEvent from '../../core/util/AppEvent';

export default {
  name: 'DocEdit',
  props: ['folder'],
  mixins: [ EntryActionProvider ],
  data: function () {
    return {
      showTagForm: false,
      autoSave: false,
      htmlEditorInstance: null,
      doc: new NPDoc()
    };
  },
  components: { LabelInput, Message },
  methods: {
    docFormat (format) {
      if (!format) {
        format = this.doc.format;
      }
      if (format == 'MD') {
        return 'markdownify';
      } else {
        return format.toLowerCase();
      }
    },
    switchFormat(newFormat) {
      if (this.doc.format === 'TEXT' && newFormat === 'HTML') {
        this.doc.note = this.doc.note.replace(/(\r\n|\n|\r)/gm, '<br/>');
        this.doc.format = 'HTML';

        if (this.htmlEditorInstance == null) {
          let componentSelf = this;
          this.initHtmlEditor().then(function (editor) {
            componentSelf.htmlEditorInstance.setData(componentSelf.doc.note);
          });
        } else {
          this.htmlEditorInstance.setData(this.doc.note);
        }
      }
    },
    initHtmlEditor () {
      let componentSelf = this;
      return new Promise((resolve, reject) => {
        // https://docs.ckeditor.com/ckeditor5/latest/builds/guides/integration/configuration.html
        if (componentSelf.htmlEditorInstance === null) {
          ClassicEditor.create(document.querySelector('#DocCKEditor'), {
            extraPlugins: [ (editor) => {
              editor.plugins.get('FileRepository').createUploadAdapter = (loader) => {
                // Configure the URL to the upload script in your back-end here!
                return new CKEditorUploadAdapter(loader, componentSelf.doc);
              };
            } ],
          })
          .then(editor => {
            componentSelf.htmlEditorInstance = editor;

            editor.ui.view.editable.editableElement.style.height = componentSelf.editorHeight(true);

            // https://docs.ckeditor.com/ckeditor5/latest/api/module_engine_model_document-Document.html#event-change
            editor.model.document.on('change', () => {
              if (componentSelf.htmlEditorInstance.model.document.differ.getChanges().length > 0 &&
                  componentSelf.doc.note.length !== componentSelf.htmlEditorInstance.getData().length) {
                componentSelf.doc.note = componentSelf.htmlEditorInstance.getData();
              }
            });
            resolve(this.htmlEditorInstance);
          })
          .catch(error => {
            console.error(error);
            reject();
          });
        } else {
          resolve(this.htmlEditorInstance);
        }
      });
    },
    editorHeight (px) {
      if (px)
        return (window.innerHeight - 160).toString() + 'px';
      return window.innerHeight - 160;
    },
    collectTags () {
      this.doc.tags = this.$refs.tagInput.getLabels();
    }
  },
  mounted () {
    this.autoSaver = new AutoSaver();

    this.doc = NPDoc.blankInstance(this.folder);

    if (this.$route.params.entryId) {
      this.doc.entryId = this.$route.params.entryId;

      let componentSelf = this;
      AccountService.hello()
        .then(function (response) {
          EntryService.get(componentSelf.doc)
            .then(function (docObj) {
              // make a copy here so locally in DocEdit a separate object is being referenced
              componentSelf.doc.copy(docObj);
              // repoint the folder reference to the one in the component so changing folder would work
              componentSelf.doc.folder = componentSelf.folder;
              componentSelf.initHtmlEditor().then(function (editor) {
                if (componentSelf.doc.format === 'HTML') {
                  componentSelf.htmlEditorInstance.setData(componentSelf.doc.note);
                }
              });
            })
            .catch(function (error) {
              console.log(error);
            });
        })
        .catch(function (error) {
          console.log(error);
        });
    }
  },
  updated () {
    this.autoSave = true;
  },
  watch: {
    'doc.note': function (newVal, oldVal) {
      if (!this.autoSave) {
        return;
      }

      // no need to auto save a new entry that has no content
      if (!newVal && !this.entryId) {
        return;
      }

      let componentSelf = this;
      this.autoSaver.changeDetected(this.doc)
        .then(function (savedObj) {
          if (savedObj !== false) {
            // the savedObj should not be used locally
            EventManager.publishAppEvent(AppEvent.ofSuccess(AppEvent.ENTRY_UPDATE, savedObj));
            // need to assign the entryId if this is a new entry
            componentSelf.doc.entryId = savedObj.entryId;
            console.log('savd in auto save...');
          }
        })
        .catch(function (error) {
          console.log(error);
          EventManager.publishAppEvent(AppEvent.ofFailure(AppEvent.ENTRY_UPDATE, error));
        });
    }
  },
  beforeDestroy () {
    if (this.autoSaver) {
      this.autoSaver.destroy();
    }
  }
};
</script> 