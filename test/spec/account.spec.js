import AccountService from '../../src/core/service/AccountService';

fdescribe('Account tests', function () {
  xit('should handle account setting', function (done) {
    AccountService.hello()
      .then(function (currentUser) {
        console.log(currentUser.sessionId)
        done();
      })
      .catch(function (error) {
        console.log(error);
        done();
      });
  });

  it('should login', function (done) {
    AccountService.login('ren', 'ren')
      .then(function (currentUser) {
        console.log(currentUser)
        done();
      })
      .catch(function (error) {
        console.log(error);
        done();
      });
  });
});
