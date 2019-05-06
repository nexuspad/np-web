import NPFolder from './NPFolder';
import NPUser from './NPUser';

export default class NPShareRoot extends NPFolder {
  static instance (moduleId, ownerId, displayName) {
    let obj = new NPShareRoot();
    obj.moduleId = moduleId;
    obj.folderId = NPFolder.ROOT;
    obj.folderName = displayName;
    obj.owner = new NPUser();
    obj.owner.setUserId(ownerId);
    return obj;
  }

  isMyFolder () {
    return false;
  }

  isRootFolderShared () {
    if (this.accessPermission.permission.read) {
      return true;
    }
    return false;
  }
}
