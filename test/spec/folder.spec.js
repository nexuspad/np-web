import NPFolder from '../../src/core/datamodel/NPFolder'
import FolderService from '../../src/core/service/FolderService';
import NPModule from '../../src/core/datamodel/NPModule';
import NPUser from '../../src/core/datamodel/NPUser';
import ServiceAction from '../../src/core/service/ServiceAction';
import AccountService from '../../src/core/service/AccountService';

let mockFolder = new NPFolder();

describe('FolderService', function () {
  xit('should get all folders for module', function (done) {
    FolderService.getAllFolders(NPModule.BOOKMARK)
      .then(function (folderTree) {
        console.log(folderTree);
        done();
      })
      .catch(function (error) {
        console.log(error);
        done();
      });
  });

  it('should update folder', function (done) {
    mockFolder.moduleId = NPModule.BOOKMARK;
    mockFolder.folderId = 132;
    mockFolder.folderName = 'marketing 101';
    mockFolder.owner = AccountService.currentUser;

    FolderService.save(mockFolder, ServiceAction.UPDATE)
      .then(function (folder) {
        console.log(folder);
        done();
      })
      .catch(function (error) {
        console.log(error);
        done();
      });
  });

  xit('should update folder color label', function (done) {
    mockFolder.moduleId = NPModule.BOOKMARK;
    mockFolder.folderId = 132;
    mockFolder.colorLabel = '336699';
    mockFolder.owner = AccountService.currentUser;

    FolderService.save(mockFolder, ServiceAction.UPDATE_COLOR_LABEL)
      .then(function (folder) {
        console.log(folder);
        done();
      })
      .catch(function (error) {
        console.log(error);
        done();
      });
  });

  xit('should move folder', function (done) {
  });

  xit('should delete folder', function (done) {
    mockFolder.moduleId = NPModule.BOOKMARK;
    mockFolder.folderId = 132;
    mockFolder.owner = AccountService.currentUser;

    FolderService.delete(mockFolder)
      .then(function (folder) {
        console.log(folder);
        done();
      })
      .catch(function (error) {
        console.log(error);
        done();
      });
  });

  xit('should restore folder', function (done) {
    mockFolder.moduleId = NPModule.BOOKMARK;
    mockFolder.folderId = 132;
    mockFolder.status = 0;
    mockFolder.owner = AccountService.currentUser;

    FolderService.restore(mockFolder)
      .then(function (folder) {
        console.log(folder);
        done();
      })
      .catch(function (error) {
        console.log(error);
        done();
      });
  });

  xit('should share folder', function (done) {
    mockFolder.moduleId = NPModule.BOOKMARK;
    mockFolder.folderId = 132;
    mockFolder.status = 0;
    mockFolder.owner = AccountService.currentUser;

    let shareTo = new NPUser();
    shareTo.setUserId(58);

    FolderService.updateSharing(mockFolder, shareTo, true, false)
      .then(function (folder) {
        console.log(folder);
        done();
      })
      .catch(function (error) {
        console.log(error);
        done();
      });
  });

  xit('should un-share folder', function (done) {
    mockFolder.moduleId = NPModule.BOOKMARK;
    mockFolder.folderId = 132;
    mockFolder.status = 0;
    mockFolder.owner = AccountService.currentUser;

    let shareTo = new NPUser();
    shareTo.setUserId(58);

    FolderService.updateSharing(mockFolder, shareTo, false, false)
      .then(function (folder) {
        console.log(folder);
        done();
      })
      .catch(function (error) {
        console.log(error);
        done();
      });
  });
});
