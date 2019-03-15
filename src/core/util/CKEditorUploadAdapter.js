import AccountService from '../service/AccountService';
import EntryService from '../service/EntryService';
import UploadService from '../service/UploadService';

export default class CKEditorUploadAdapter {
  constructor (loader, doc) {
    // The file loader instance to use during the upload.
    this.loader = loader;
    this.doc = doc;
  }

  // Starts the upload process.
  upload () {
    let uploadService = new UploadService();
    let self = this;

    return new Promise((resolve, reject) => {
      if (!this.doc.entryId) {
        // this is a new doc
        AccountService.hello()
        .then(function () {
          EntryService.save(self.doc)
            .then(function (updatedObj) {
              self.doc.entryId = updatedObj.entryId;
              uploadService.uploadFile(self.doc.folder, self.doc.entryId, self.loader.file,
                function ({loaded, total}) {
                  self.loader.loaded = loaded;
                  self.loader.total = total;
                })
                .then(function (result) {
                  console.log('upload entry completed for parent entry.', result.parentEntry);
                  resolve({default: result.uploadEntry.downloadLink});
                })
                .catch(function (error) {
                  console.log(error);
                  reject(error);
                });
            })
            .catch(function (error) {
              reject(error);
            });
        })
        .catch(function (error) {
          console.log(error);
          reject(error);
        });
      } else {
        return uploadService.uploadFile(self.doc.folder, self.doc.entryId, self.loader.file,
          function ({loaded, total}) {
            self.loader.loaded = loaded;
            self.loader.total = total;
          })
          .then(function (result) {
            console.log('upload entry completed for parent entry.', result.parentEntry);
            resolve({default: result.uploadEntry.downloadLink});
          })
          .catch(function (error) {
            console.log(error);
            reject(error);
          });
      }  
    });
  }

  // Aborts the upload process.
  abort () {
    if ( this.xhr ) {
      this.xhr.abort();
    }
  }
}