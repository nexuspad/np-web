<template>
  <div>
    <div class="mb-4" v-if="files.length > 0">
      <div class="row pb-2" v-for="(fileObj, index) in files" v-bind:key="index">
        <div class="col">
          <span v-bind:class="{active : fileObj.status === 'uploading'}">{{ fileObj.file.name }}</span>
        </div>
        <div class="col align-bottom">
          <!-- <b-progress height="2px" :value="fileObj.uploadProgress" class="mt-3"></b-progress> -->
          {{ fileObj.uploadProgress }}
        </div>
        <div class="col align-bottom">
          <span v-bind:class="{'text-danger': fileObj.status === 'failed', 'text-success': fileObj.status === 'completed'}">
            {{ npContent(fileObj.status) }}
          </span>
          <span v-if="fileObj.status !== 'completed' && fileObj.status !== 'cancelled'">
            <span class="badge float-right" @click="cancelUpload(index, fileObj)">
              <i class="fas fa-times-circle fa-lg np-danger mt-2"></i>
            </span>
          </span>
        </div>
      </div>
    </div>
    <form role="form" class="form" onsubmit="return false;">
      <div class="btn-toolbar justify-content-between" role="toolbar">
        <div class="btn-group">
          <label class="btn btn-primary">
            {{npContent('select file')}}
            <input type="file" style="display: none;" ref="fileInput" @change="fileSelected($event)" multiple>
          </label>
          <label class="btn btn-secondary" style="margin-left:1px;" v-on:click="clearAll()" v-if="files.length > 0">
            {{npContent('clear all')}}
          </label>
        </div>
        <div class="btn-group" v-show="hasFileWaiting()">
          <label class="btn btn-primary" v-on:click="upload()">{{npContent('upload')}}</label>
        </div>
        <div class="btn-group" v-show="!hasFileWaiting()">
          <label class="btn btn-outline-danger" v-on:click="close()">{{npContent('close')}}</label>
        </div>
      </div>
    </form>
  </div>  
</template>

<script>
import UploadService from '../../core/service/UploadService';
import FileWrapper from '../../core/datamodel/FileWrapper';
import EventManager from '../../core/util/EventManager';
import AppEvent from '../../core/util/AppEvent';
import SiteProvider from './SiteProvider';

export default {
  name: 'Uploader',
  props: ['folder', 'entry'],
  mixins: [ SiteProvider ],
  data: function () {
    return {
      files: [],
      serviceReferences: [],
      maxConcurrentUpload: 2,
      timeInterval: 5,
      timerId: 0
    };
  },
  mounted () {
  },
  methods: {
    fileSelected () {
      for (let file of this.$refs.fileInput.files) {
        if (!this.alreadySelected(file)) {
          this.files.push(new FileWrapper(file));
        }
      }
      // clear the value so onChange will fire when same file is selected
      this.$refs.fileInput.value = null;
      return false;
    },
    alreadySelected (file) {
      for (let fileObj of this.files) {
        // this is just a guess
        if (fileObj.file.name === file.name && fileObj.file.size === file.size && fileObj.file.type === file.type) {
          if (fileObj.status === FileWrapper.CANCELLED || fileObj.status === FileWrapper.FAILED) {
            // resume uploading
            fileObj.status = FileWrapper.WAITING;
          }
          return true;
        }
      }
      return false;
    },
    hasFileWaiting () {
      for (let fileObj of this.files) {
        if (fileObj.status === FileWrapper.WAITING) {
          return true;
        }
      }
      return false;
    },
    upload () {
      this._uploadAll();
      let self = this;
      if (this.files.length > this.maxConcurrentUpload) {
        if (this.timerId === 0) {
          this.timerId = setInterval(() => {
            console.debug('kick in uploading cycle.........');
            self._uploadAll()
          }, this.timeInterval * 1000);
        }
      }
    },
    _uploadAll () {
      if (!this.folder && !this.entry) {
        return;
      }

      let entryId = '';
      if (this.entry) { // attaching to an existing entry
        entryId = this.entry.entryId;
      }

      // let componentSelf = this;
      for (let fileObj of this.files) {
        if (fileObj.status !== FileWrapper.WAITING) {
          continue;
        }

        let serviceInstance = this.getServiceFromPool();
        if (serviceInstance === null) {
          console.debug('no more upload service instance, wait ' + this.timeInterval + ' seconds');
          break;
        }

        serviceInstance.uploadFile(this.folder, entryId, fileObj.file,
          function ({uploadId = '', completed = 0}) {
            if (uploadId.length !== 0) {
              fileObj.uploadId = uploadId;
            }
            // completion callback may happend after cancellation. make sure keep the status as cancelled.
            if (fileObj.status === FileWrapper.CANCELLED || fileObj.status === FileWrapper.FAILED) {
              fileObj.uploadProgress = 0;
            } else {
              fileObj.uploadProgress = completed;
              fileObj.status = FileWrapper.UPLOADING;
            }
          })
          .then(function (result) {
            console.log('upload entry completed for parent entry.', result.parentEntry);
            // publish an update event after successful uploading.
            fileObj.status = FileWrapper.COMPLETED;
            EventManager.publishAppEvent(AppEvent.ofSuccess(AppEvent.ENTRY_UPDATE, result.parentEntry));
          })
          .catch(function (error) {
            if (fileObj.status !== FileWrapper.CANCELLED) {
              console.log(error);
              fileObj.status = FileWrapper.FAILED;
            }
          });
      }
    },
    getServiceFromPool () {
      console.log('upload service pool size: ', this.serviceReferences.length);
      if (this.serviceReferences.length < this.maxConcurrentUpload) {
        let uploadService = new UploadService();
        this.serviceReferences.push(uploadService);
        return uploadService;
      } else {
        let i = this.serviceReferences.length;
        while (i--) {
          if (this.serviceReferences[i].isDone()) {
            console.log('free service instance from the pool');
            this.serviceReferences.splice(i, 1);
          }
        }
        if (this.serviceReferences.length < this.maxConcurrentUpload) {
          let uploadService = new UploadService();
          this.serviceReferences.push(uploadService);
          return uploadService;
        }
      }
      return null;
    },
    cancelUpload (index, fileObj) {
      if (fileObj.uploadId.length > 0) {
        console.log('cancel upload for ', fileObj.uploadId);
        this.serviceReferences.forEach(uploadService => {
          if (uploadService.uploadId === fileObj.uploadId) {
            uploadService.cancelUpload();
            fileObj.uploadProgress = 0;
            fileObj.status = FileWrapper.CANCELLED;
          }
        });
      } else {
        this.files.splice(index, 1);
      }
    },
    clearAll () {
      while (this.files.length > 0) {
        this.files.pop();
      }
    },
    close () {
      if (this.timerId !== 0) {
        console.log('stop upload process ' + this.timerId);
        clearInterval(this.timerId);
      }
      this.$emit('closeUploadModal', true);
    }
  },
  beforeUnmount () {
    this.close();
  }
}
</script>
