import NPContact from '../../src/core/datamodel/NPContact';
import ContactService from '../../src/core/service/ContactService';

let mockContact;

beforeAll(function () {
  mockContact = new NPContact();
  mockContact.entryId = 'kLAwS';
});

describe('Contact testing', function () {
  it('should retrieve a contact', function (done) {
    ContactService.get(mockContact)
      .then(function (contact) {
        mockContact = contact;
        console.log(mockContact);
        done();
      })
      .catch(function (error) {
        console.log(error);
        done();
      });
  });

  it('should update contact', function (done) {
    mockContact.addPhone('4042223333', 'mobile');
    ContactService.save(mockContact)
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
