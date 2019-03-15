import NPEntry from '../datamodel/NPEntry';
import NPFolder from '../datamodel/NPFolder';
import EntryList from '../datamodel/EntryList';

export default class EntryServiceData {
  entry = null;
  entryList = null;
  updateAction = null;
  errorCode = null;
  errorReason = null;

  static of (entry, action) {
    let serviceData = new EntryServiceData();
    serviceData.entry = entry;
    serviceData.updateAction = action;
    return serviceData;
  }

  static ofMultipleUpdates (entryIdsArr, action, folder) {
    let serviceData = new EntryServiceData();
    let entryObjs = [];
    entryIdsArr.forEach(id => {
      let e = NPEntry.of(folder.moduleId);
      e.entryId = id;
      entryObjs.push(e);
    });

    serviceData.entryList = new EntryList();
    serviceData.entryList.entries = entryObjs;
    serviceData.updateAction = action;

    // make a light copy for API
    let theFolder = new NPFolder();
    theFolder.folderId = folder.folderId;
    theFolder.module = folder.module;
    theFolder.moduleId = folder.moduleId;
    theFolder.owner = folder.owner;

    serviceData.entryList.folder = theFolder;

    return serviceData;
  }

  convertToJsonForPosting () {
    return {
      entry: this.entry.toJson(),
      updateAction: this.updateAction
    };
  }
}
