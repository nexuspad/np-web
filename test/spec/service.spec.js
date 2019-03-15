import ServiceHelper from '../../src/core/service/ServiceHelper';
import EntryService from '../../src/core/service/EntryService';
import NPModule from '../../src/core/datamodel/NPModule'
import NPEntry from '../../src/core/datamodel/NPEntry'
import RestClient from '../../src/core/util/RestClient'

describe('Service', function () {
  it('should have enpoints defined', function () {
    expect(ServiceHelper.acct).toEqual('/user');

    let entry = new NPEntry();
    entry.moduleId = NPModule.DOC;
    entry.entryId = 'aaaaa';
    let uri = EntryService.getEntryEndPoint(entry);
    expect(uri).toEqual('/doc/' + entry.entryId);
  });

  it('should make RestAPI call', function (done) {
    RestClient.get('https://jsonplaceholder.typicode.com/posts/1')
      .then(function (response) {
        // console.log(response);
        done();
      })
      .catch(function (error) {
        RestClient.handleError(error);
        done();
      });
  });
});
