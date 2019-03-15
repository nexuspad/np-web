import NPModule from '../../src/core/datamodel/NPModule'
import ListSetting from '../../src/core/datamodel/ListSetting'
import ListService from '../../src/core/service/ListService';
import EntryService from '../../src/core/service/EntryService';
import NPFolder from '../../src/core/datamodel/NPFolder';
import NPEntry from '../../src/core/datamodel/NPEntry'

let testBookmark;

describe('Bookmark list', function () {
  it('should show bookmarks on page 1 in a folder', function (done) {
    let listSetting = ListSetting.ofPaging(NPModule.BOOKMARK, NPFolder.ROOT, 1);
    ListService.getEntries(listSetting)
      .then(function (response) {
        // console.log(response);
        done();
      })
      .catch(function (error) {
        console.log(error);
        done();
      });
  });
});

describe('Bookmark CRUD', function () {
  it('should add new bookmark', function (done) {
    testBookmark = new NPEntry();
    testBookmark.moduleId = NPModule.BOOKMARK;

    EntryService.save(testBookmark)
      .then(function (entry) {
        testBookmark = entry;
        done();
      })
      .catch(function (error) {
        console.log(error);
        done();
      });
  });

  it('should update bookmark by Id', function (done) {
    EntryService.save(testBookmark)
      .then(function (entry) {
        // console.log(entry);
        done();
      })
      .catch(function (error) {
        console.log(error);
        done();
      });
  });

  it('should trash bookmark by Id', function (done) {
    EntryService.delete(testBookmark)
      .then(function (entry) {
        console.log(entry);
        done();
      })
      .catch(function (error) {
        console.log(error);
        done();
      });
  });
});
