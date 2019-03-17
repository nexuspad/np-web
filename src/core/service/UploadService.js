import BaseService from './BaseService';
import RestClient from '../util/RestClient';
import AccountService from './AccountService';
import PromiseManager from '../util/PromiseManager'
import EntryService from './EntryService';
import EntryServiceData from './EntryServiceData';
import NPUpload from '../datamodel/NPUpload';
import ListServiceFactory from './ListServiceFactory';
import ErrorHandler from '../util/ErrorHandler'
import NPError from '../datamodel/NPError';
import NPModule from '../datamodel/NPModule';

export default class UploadService extends BaseService {
  uploadId = '';
  // for cancellation
  _axiosSource = null;
  _cancelled = false;
  _active = true;

  uploadFile (folder, entryId, file, progressCallback) {
    let uploadEntryUrl = BaseService.getUploadPlaceHolderEndPoint(folder.moduleId, entryId);

    let promiseKey = uploadEntryUrl + file.name;
    let p = PromiseManager.get(promiseKey);

    if (p) {
      return p;
    } else {
      let self = this;
      let httpClient = RestClient.instance(AccountService.currentSession(), BaseService.getHeaders({folder: folder}));

      p = new Promise((resolve, reject) => {
        console.log(EntryServiceData.of(NPUpload.initWith(file, folder.moduleId, folder.folderId)));
        let serviceData = EntryServiceData.of(NPUpload.initWith(file, folder.moduleId, folder.folderId)).convertToJsonForPosting();
        console.log(serviceData);
        // ============ I. create place holder for the upload ============
        httpClient.post(uploadEntryUrl, serviceData)
          .then(function (response) {
            // Parse application level response data
            if (response.data.errorCode) {
              self._concludeService({ resolve:resolve, reject:reject, error:new NPError(response.data.errorCode) });
            } else {
              let uploadEntry = EntryService.initEntryObj(response.data.entry);
              self.uploadId = uploadEntry.entryId;
              progressCallback({ uploadId: uploadEntry.entryId });

              // ============ II. upload the file to the cloud ============
              self._uploadToCloud(uploadEntry, file, progressCallback)
                .then(function (response) {
                  // ============ III. complete the rest ============
                  self._completeUpload(uploadEntry)
                    .then(function (response) {
                      if (response.data.errorCode) {
                        self._concludeService({ resolve:resolve, reject:reject, error:new NPError(response.data.errorCode) });
                      } else {
                        // ============ FINAL resolve ============
                        let parentEntry = EntryService.initEntryObj(response.data.entry);
                        // TO-DO the list may be a timeline list
                        let listService = ListServiceFactory.locate({
                          moduleId: parentEntry.getModuleId(),
                          folderId: parentEntry.folder.folderId,
                          ownerId: parentEntry.getOwnerId()
                        }, false);

                        if (!listService) {
                          console.log('list service not located...');
                        } else {
                          listService.updateEntriesInList(parentEntry.getModuleId(), Array(1).fill(parentEntry));
                        }

                        self._concludeService({ resolve:resolve, reject:reject, parentEntry:parentEntry, uploadEntry: uploadEntry });
                      }
                    })
                    .catch(function (error) {
                      let rc = ErrorHandler.handleError(error);
                      self._concludeService({ resolve:resolve, reject:reject, error:new NPError(rc) });
                    });
                })
                .catch(function (error) {
                  // delete the upload entry
                  EntryService.delete(uploadEntry);
                  if (self._cancelled) {
                    self._concludeService({ resolve:resolve, reject:reject, error:new NPError(NPError.ABORT) });
                  } else {
                    console.log(error);
                    let rc = ErrorHandler.handleError(error);
                    self._concludeService({ resolve:resolve, reject:reject, error:new NPError(rc) });
                  }
                })
            }
          })
          .catch(function (error) {
            let rc = ErrorHandler.handleError(error);
            self._concludeService({ resolve:resolve, reject:reject, error:new NPError(rc) });
          });
      });

      PromiseManager.set(promiseKey, p);
      return p;
    }
  }

  cancelUpload () {
    this._cancelled = true;
    if (this._axiosSource !== null) {
      console.log('cancel the upload');
      this._axiosSource.cancel('upload cancelled by user');
    }
  }

  isDone () {
    return !this._active;
  }

  _uploadToCloud (uploadEntry, file, progressCallback) {
    let axiosClient = RestClient.instanceForUploading();

    const CancelToken = axiosClient.CancelToken;
    this._axiosSource = CancelToken.source();

    let option = {
      headers: { 'content-type': 'multipart/form-data' },
      onUploadProgress: function (progressEvent) {
        let percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        if (progressCallback) {
          // loaded and total are for CKEditorUploadAdapter
          progressCallback({ completed: percentCompleted, loaded: progressEvent.loaded, total: progressEvent.total });
        }
      },
      cancelToken: this._axiosSource.token
    };

    let formData = new FormData();

    // key attribute must go in first
    formData.append('key', uploadEntry.cloudConfig.s3_key);
    formData.append('AWSAccessKeyId', uploadEntry.cloudConfig.aws_access_key);
    formData.append('acl', 'private');
    formData.append('policy', uploadEntry.cloudConfig.s3_policy);
    formData.append('signature', uploadEntry.cloudConfig.s3_signature);
    formData.append('Content-Type', uploadEntry.fileType);
    formData.append('filename', uploadEntry.fileName);
    formData.append('file', file);

    console.log('submit form data for uploading', formData);

    return axiosClient.post(uploadEntry.cloudConfig.s3_url, formData, option);
  }

  _completeUpload (uploadEntry) {
    let httpClient = RestClient.instance(AccountService.currentSession(), BaseService.getHeaders({entry: uploadEntry}));
    let uri = BaseService.getUploadCompletionEndPoint(uploadEntry);
    return httpClient.post(uri);
  }

  _concludeService ({ resolve, reject, parentEntry = null, uploadEntry = null, error = null }) {
    this._active = false;
    if (parentEntry !== null) {
      if (uploadEntry !== null) {
        // this uploadEntry is not a complete object returned from the service.
        // doc object with attachments will be returned from the service, so the correct uploadEntry
        // needs to be pulled from attachment array.
        if (parentEntry.moduleId === NPModule.DOC) {
          for (let i = 0; i < parentEntry.attachments.length; i++) {
            if (parentEntry.attachments[i].entryId === uploadEntry.entryId) {
              uploadEntry = parentEntry.attachments[i];
            }
          }  
        }
        resolve({ parentEntry: parentEntry, uploadEntry: uploadEntry });
      } else {
        resolve({ parentEntry: parentEntry });
      }
    } else {
      reject(error);
    }
  }

  mockUploadFile (folder, entryId, file, progressCallback) {
    let self = this;
    let mockEntry = new NPUpload();
    return new Promise((resolve, reject) => {
      progressCallback({ completed: 50 });
      let randomSeconds = 6 + Math.floor(Math.random() * 10);
      setTimeout(() => {
        progressCallback({ completed: 100 });
        self._concludeService({ resolve:resolve, parentEntry:mockEntry })
      }, randomSeconds * 1000);
    });
  }
}
