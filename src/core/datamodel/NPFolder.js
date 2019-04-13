import NPModule from './NPModule';
import AccessPermission from './AccessPermission';
import NPUser from './NPUser';

export default class NPFolder {
  static ROOT = 0;
  static TRASH = 9;
  static UNASSIGNED = -1;

  // the attributes need to be defined so they can be watched in UI component.
  // for instance, VueJs will not detect the change if folderId changed from undefined to a value.
  folderId = NPFolder.UNASSIGNED;
  folderName = '';
  module = '';
  moduleId = 0;

  accessPermission = new AccessPermission();

  subFolders = [];
  sharing = [];

  constructor (data) {
    if (data) {
      this.folderId = data['folderId'];
      this.folderName = data['folderName'];
      this.module = data['module'];
      this.moduleId = data['moduleId'];
      this.code = data['code'];

      this.colorLabel = data['colorLabel'];

      this.owner = new NPUser(data['owner']);

      if (data['accessPermission']) {
        this.accessPermission = new AccessPermission(data['accessPermission']);
      }
      if (data['parent']) {
        this.parent = new NPFolder(data['parent']);
      }
      this.sharingStatus = data['sharingStatus'];

      if (data['sharing'] && data['sharing'].length > 0) {
        data['sharing'].forEach(rec => {
          this.sharing.push(new AccessPermission(rec));
        });
      }

      this.subFolders = data['subFolders'];
    }

    if (!this.colorLabel) {
      this.colorLabel = '#336699';
    } else {
      if (this.colorLabel.length === 9) {
        // remove the alpha channel information
        this.colorLabel = '#' + this.colorLabel.substring(3);
      }
    }
  }

  copy (otherFolder) {
    if (otherFolder) {
      this.folderId = otherFolder.folderId;
      this.folderName = otherFolder.folderName;
      this.moduleId = otherFolder.moduleId;
      this.module = otherFolder.module;
      let u = new NPUser();
      this.owner = u.copy(otherFolder.owner);
    }
  }
  
  static of (moduleId, folderId, ownerObj, accessPermission) {
    let folderObj = new NPFolder();
    folderObj.moduleId = moduleId;
    folderObj.module = NPModule.codeForId(moduleId).toUpperCase();

    // create new folder when folderId is null.
    if (folderId !== null) {
      folderObj.folderId = folderId;
    }

    if (ownerObj) {
      folderObj.owner = ownerObj;
    } else {
      folderObj.owner = new NPUser;
    }

    if (accessPermission) {
      folderObj.accessPermission = accessPermission;
    }

    if (folderId === 0) {
      if (moduleId === NPModule.CONTACT) {
        folderObj.folderName = 'all contacts';
      } else if (moduleId === NPModule.CALENDAR) {
        folderObj.folderName = 'all events';
      } else {
        folderObj.folderName = 'root folder';
      }
    }

    return folderObj;
  }

  static initWith (data) {
    let folderObj = new NPFolder(data);
    if (!folderObj.subFolders) {
      folderObj.subFolders = [];
    }
    return folderObj;
  }

  static makeCopy (from, to) {
    if (!to) to = new NPFolder();
    to.folderId = from.folderId;
    to.folderName = from.folderName;
    to.module = from.module;
    to.moduleId = from.moduleId;
    to.code = from.code;
    to.colorLabel = from.colorLabel;
    to.owner = from.owner;
    to.accessPermission = new AccessPermission(from.accessPermission);
    if (from.parent) {
      to.parent = NPFolder.makeCopy(from.parent);
    } else {
      to.parent = null;
    }
    to.sharingStatus = from.sharingStatus;
    to.sharing = from.sharing;
    to.subFolders = from.subFolders;
    return to;
  }

  trashFolder () {
    this.folderId = 3;
    this.folderName = 'trash'
  }

  isRoot () {
    if (this.folderId === 0) {
      return true;
    }
    return false;
  }

  getOwnerId () {
    if (this.owner) {
      return this.owner.userId;
    }
    if (this.accessInfo) {
      return this.acceseInfo.ownerId;
    }
  }

  getName () {
    if (!this.moduleId) {
      return 'error';
    }
    if (this.folderId === 0) {
      return 'home';
    } else {
      return this.folderName;
    }
  }

  setName (folderName) {
    if (folderName === 'trash') {
      this.folder_id = 3;
    } else if (folderName === 'dropbox') {
      this.folder_id = 5;
    } else if (folderName === 'home') {
      this.folder_id = 0;
    }

    this.folderName = folderName;
  }

  getColorLabel () {
    if (this.colorLabel !== '#336699') {
      return this.colorLabel;
    }
    return '';
  }

  isValid () {
    if (this.moduleId > 0 && this.folderId >= 0) {
      return true;
    }
    return false;
  }

  // this is overriden in NPShareRoot
  isMyFolder () {
    if (this.accessPermission.accessor && this.owner && this.accessPermission.accessor.userId !== this.owner.userId) {
      return false;
    }
    return true;
  }

  hasWritePermission () {
    if (this.isMyFolder()) {
      return true;
    }
    if (this.accessPermission && this.accessPermission.permission.write) {
      return true;
    }
    return false;
  }

  isEqual (otherFolder) {
    if (this.moduleId === otherFolder.moduleId &&
      this.folderId === otherFolder.folderId &&
      this.accessInfo.ownerId === otherFolder.accessInfo.ownerId) {
      return true;
    }
    return false;
  }

  toJson () {
    let data = {
      moduleId: this.moduleId,
      folderId: this.folderId,
      folderName: this.folderName,
      colorLabel: this.colorLabel
    }

    if (this.owner) {
      data['owner'] = this.owner.toJson();
    }

    if (this.parent) {
      data['parent'] = this.parent.toJson();
    }

    if (this.sharing && this.sharing.length > 0) {
      data['sharing'] = [];
      for (let accessPermission of this.sharing) {
        data['sharing'].push(accessPermission.toJson());
      }
    }

    return data;
  }

  toString () {
    return 'module: ' + this.moduleId + ' folder: ' + this.folderName + ' ' + this.folderId;
  }

  static key ({folder: folderObj, moduleId: moduleId, folderId: folderId, ownerId: ownerId}) {
    if (folderObj) {
      return folderObj.moduleId + '_' + folderObj.folderId + '_' + folderObj.getOwnerId();
    } else {
      if (!moduleId) moduleId = 0;
      if (!folderId) folderId = 0;
      if (!ownerId) ownerId = 0;
      return moduleId + '_' + folderId + '_' + ownerId;
    }
  }
}
