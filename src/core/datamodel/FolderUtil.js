import NPFolder from './NPFolder';

export default class FolderUtil {
  static folderArrayCopy (folderArr) {
    return folderArr.map(f => NPFolder.makeCopy(f));
  }

  static convertToTree (folderArr, root) {
    let folderTree = [];

    let allFolderIds = folderArr.map((f) => {
      return f.folderId;
    });

    // Add all the level 1 folders first
    for (let i = folderArr.length - 1; i >= 0; i--) {
      if (folderArr[i].folderId === 0) {
        root = folderArr[i];
        folderArr.splice(i, 1);
        continue;
      }

      if (!folderArr[i].parent || !folderArr[i].subFolders) {
        throw new Error('The folder object is not properly initialized');
      }

      // reset the subfolders since the tree may be rebuilt
      folderArr[i].subFolders = [];

      if (folderArr[i].parent.folderId === 0) {
        folderTree.push(folderArr[i]);
        folderArr.splice(i, 1);
      }
    }

    // add the "orphaned" folders to the root level first
    for (let i = folderArr.length - 1; i >= 0; i--) {
      if (allFolderIds.indexOf(folderArr[i].parent.folderId) === -1) {
        folderTree.push(folderArr[i]);
        folderArr.splice(i, 1);
      }
    }    

    // Add the child folders
    let MAX_ITERATION = folderArr.length * folderArr.length;
    let iterationCount = 0;

    while (folderArr.length > 0) {
      if (iterationCount > MAX_ITERATION) {
        throw new Error('Folder tree reached max iteration.');
      }

      let lengthBefore = folderArr.length;

      for (let i = folderArr.length - 1; i >= 0; i--) {
        iterationCount++;

        if (FolderUtil._addChildNodeToFolderTree(folderTree, folderArr[i])) {
          folderArr.splice(i, 1);
        }
      }

      if (folderArr.length === lengthBefore) {
        break;
      }
    }

    FolderUtil.sortFolderTree(folderTree);

    if (root) {
      root.subFolders = folderTree;
      return root;
    }

    return folderTree;
  }

  static _addChildNodeToFolderTree (folderTree, folder) {
    let len = folderTree.length;

    for (let i = 0; i < len; i++) {
      if (folderTree[i].folderId === folder.parent.folderId) {
        folderTree[i].subFolders.push(folder);
        return true;
      } else if (folderTree[i].subFolders.length > 0) {
        if (FolderUtil._addChildNodeToFolderTree(folderTree[i].subFolders, folder)) {
          return true;
        }
      }
    }
    return false;
  }

  static sortFolderTree (folderTree) {
    folderTree.sort(function (f1, f2) {
      let name1 = f1.folderName.toUpperCase();
      let name2 = f2.folderName.toUpperCase();

      if (name1 < name2) {
        return -1;
      }

      if (name1 > name2) {
        return 1;
      }

      return 0;
    });

    let len = folderTree.length;
    for (let i = 0; i < len; i++) {
      if (folderTree[i].subFolders.length > 0) {
        FolderUtil.sortFolderTree(folderTree[i].subFolders);
      }
    }
  }
}
