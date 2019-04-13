import NPFolder from './NPFolder';
import NPUser from './NPUser';

export default class NPShareRoot extends NPFolder {
  static instance (moduleId, ownerId, displayName, folderTree) {
    let obj = new NPShareRoot();
    obj.moduleId = moduleId;
    obj.folderName = displayName;
    obj.owner = new NPUser();
    obj.owner.setUserId(ownerId);

    if (folderTree instanceof NPFolder) {
      obj.folderId = NPFolder.ROOT;
      obj.subFolders = folderTree.subFolders;  
    } else {
      obj.folderId = NPFolder.UNASSIGNED;
      obj.subFolders = folderTree;
    }

    return obj;
  }

  isMyFolder () {
    return false;
  }
}
