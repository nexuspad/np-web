import AccountService from '../service/AccountService';
import EntryService from '../service/EntryService';

export default class AutoSaver {
  entryObj;
  promiseToSave;

  constructor () {
    this.timeout = 3000;
    this.nextSaveTimeoutId = 0;
  }

  changeDetected (docObj) {
    this.entryObj = docObj;

    if (this.promiseToSave) {
      console.log('promised to save next ...');
      return Promise.resolve(false); // resolve with "save soon" flag
    }

    this.promiseToSave = new Promise((resolve, reject) => {
      let self = this;
      this.nextSaveTimeoutId = setTimeout(function () {
        AccountService.hello()
          .then(function () {
            EntryService.save(self.entryObj)
              .then(function (updatedObj) {
                resolve(updatedObj);
                self.promiseToSave = null;
              })
              .catch(function (error) {
                reject(error);
              });
          })
          .catch(function (error) {
            console.log(error);
            reject(error);
          });
      }, this.timeout);
    });

    return this.promiseToSave;
  }

  destroy () {
    if (this.nextSaveTimeoutId) {
      clearTimeout(this.nextSaveTimeoutId);
    }
  }
}
