import NPModule from '../../src/core/datamodel/NPModule'
import ListSetting from '../../src/core/datamodel/ListSetting'
import ListService from '../../src/core/service/ListService';
import NPFolder from '../../src/core/datamodel/NPFolder';

describe('ListService', function () {
  it('should make list service call', function (done) {
    let listSetting = ListSetting.ofPaging(NPModule.DOC, NPFolder.ROOT, 1);
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
