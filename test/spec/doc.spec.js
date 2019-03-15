import NPDoc from '../../src/core/datamodel/NPDoc';
import EntryService from '../../src/core/service/EntryService';
import NPEvent from '../../src/core/datamodel/NPEvent';
import UploadService from '../../src/core/service/UploadService';
import NPModule from '../../src/core/datamodel/NPModule';
import NPFolder from '../../src/core/datamodel/NPFolder';

let mockDoc;
// let mockFile = createMockFile('mock.txt', 1024, 'text/plain');

let mockFile = {};

beforeAll(function () {
  mockDoc = new NPDoc();
  mockDoc.entryId = 'AuL8Y';

  mockFile.name = 'mock.txt';
});

describe('Doc testing', function () {
  xit('should get the doc', function (done) {
    EntryService.get(mockDoc)
      .then(function (doc) {
        mockDoc = doc;
        done();
      })
      .catch(function (error) {
        console.log(error);
        done();
      });
  });

  xit('should add a reminder to doc', function (done) {
    let entryReminder = new NPEvent();
    entryReminder.localStartDate = '20180301';
    mockDoc.entryReminder = entryReminder;

    console.log(mockDoc);

    EntryService.save(mockDoc)
      .then(function (doc) {
        mockDoc = doc;
        done();
      })
      .catch(function (error) {
        console.log(error);
        done();
      });
  });

  it('should upload a file', function (done) {
    UploadService.uploadFile(NPModule.DOC, NPFolder.ROOT, null, 2, mockFile)
      .then(function (doc) {
        done();
      })
      .catch(function (error) {
        console.log(error);
        done();
      });
  });
});

function range (count) {
  let output = '';
  for (let i = 0; i < count; i++) {
    output += 'x';
    return output;
  }
}
function createMockFile (name, size, mimeType) {
  let blob = new Blob([range(size)], {type:mimeType});
  blob.lastModifiedDate = new Date();
  blob.name = name;
  return blob;
}
