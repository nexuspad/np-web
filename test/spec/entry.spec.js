import NPEntry from '../../src/core/datamodel/NPEntry'
import EntryService from '../../src/core/service/EntryService';
import NPModule from '../../src/core/datamodel/NPModule';

let mockDoc;

describe('EntryService', function () {
  xit('should get entry by Id', function (done) {
    let entry = new NPEntry();
    entry.moduleId = NPModule.DOC;
    entry.entryId = '9uhk0';

    EntryService.get(entry)
      .then(function (entry) {
        console.log(entry);
        done();
      })
      .catch(function (error) {
        console.log(error);
        done();
      });
  });

  xit('should add new entry', function (done) {
    mockDoc.entryId = '';
    mockDoc.note = 'add new doc test 1/27/2018';
    EntryService.save(mockDoc)
      .then(function (entry) {
        console.log(entry);
        done();
      })
      .catch(function (error) {
        console.log(error);
        done();
      });
  });

  it('should update entry', function (done) {
    EntryService.save(mockDoc)
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

beforeEach(function () {
  mockDoc = new NPEntry(
    {
      'owner': {
        'userId': 2,
        'title': '',
        'userName': 'ren',
        'email': 'ren.home@gmail.com',
        'firstName': 'Ren',
        'middleName': '',
        'lastName': 'Liu',
        'padDbId': 'a',
        'padHost': 'dev',
        'status': 0,
        'name': 'Ren Liu',
        'displayName': 'Ren Liu',
        'locale': 'en_US',
        'publicUser': false,
        'sessionId': '',
        'npuser': true,
        'receiverKey': 'ren.home@gmail.com'
      },
      'folder': {
        'owner': {
          'userId': 2,
          'title': '',
          'userName': 'ren',
          'email': 'ren.home@gmail.com',
          'firstName': 'Ren',
          'middleName': '',
          'lastName': 'Liu',
          'padDbId': 'a',
          'padHost': 'dev',
          'status': 0,
          'name': 'Ren Liu',
          'displayName': 'Ren Liu',
          'locale': 'en_US',
          'publicUser': false,
          'sessionId': '',
          'npuser': true,
          'receiverKey': 'ren.home@gmail.com'
        },
        'moduleId': 4,
        'folderId': 0,
        'name': '',
        'code': 'home',
        'description': '',
        'colorLabel': '',
        'status': 0,
        'sharingStatus': 0,
        'module': 'DOC'
      },
      'templateId': 403,
      'entryId': 'dMoTT',
      'syncId': '',
      'title': 'this is a test note',
      'htmlName': '',
      'description': '',
      'originalTs': 1502982517,
      'timelineKey': '201708',
      'updateDevice': '2164005f060e652eb1d623e8d9efab83',
      'reminderTs': 0,
      'tags': '',
      'note': 'test note 8/17',
      'storageLocation': 0,
      'status': 0,
      'displayOrder': 1,
      'sharingStatus': 0,
      'lastModifiedByUserId': 2,
      'accessPermission': {
        'permission': {
          'read': true,
          'write': true,
          'code': 'rw'
        },
        'accessorKey': 'ren.home@gmail.com'
      },
      'format': 'TEXT',
      'moduleId': 4,
      'module': 'DOC',
      'storageDir': '/Users/ren/Development/nexuspad/data/var/2/doc/dMoTT',
      'tmpEntry': false,
      'pinned': false
    }
  );
});
