import NPEntry from './NPEntry';
import NPModule from './NPModule';
import NPFolder from './NPFolder';
import NPItem from './NPItem';
import NPLocation from './NPLocation';

export default class NPContact extends NPEntry {
  firstName;
  lastName;
  fullName;
  businessName;
  addressbookDisplayName;
  sortKey;

  emails = [];
  primaryEmail;

  phones = [];
  address;

  constructor (data) {
    super(data);

    if (data) {
      this.firstName = data['firstName'];
      this.lastName = data['lastName'];
      this.fullName = data['fullName'];
      this.webAddress = data['webAddress'];
      this.businessName = data['businessName'];
      this.addressbookDisplayName = data['addressbookDisplayName'];
      this.sortKey = data['sortKey'];

      if (data['emails']) {
        this.emails = [];
        for (let e of data['emails']) {
          this.emails.push(new NPItem(e));
        }
      }
      this.primaryEmail = data['primaryEmail'];

      if (data['phones']) {
        this.phones = [];
        for (let p of data['phones']) {
          this.phones.push(new NPItem(p));
        }
      }

      if (data['address']) {
        this.address = new NPLocation(data['address']);
      }
    }

    if (!this.folder) {
      this.folder = NPFolder.of(NPModule.CONTACT, NPFolder.ROOT);
    }

    if (!this.emails) {
      this.emails = [];
    }

    if (!this.phones) {
      this.phones = [];
    }

    if (!this.address) {
      this.address = new NPLocation();
    }

    this.setModuleId(NPModule.CONTACT);
  }

  static blankInstance (folder, entryId) {
    let obj = new NPContact();
    obj.folder = folder;
    obj.owner = folder.owner;

    if (entryId) {
      obj.entryId = entryId;
    } else {
      obj.entryId = '';
    }

    return obj;
  }

  toJson () {
    let data = super.toJson();
    data['firstName'] = this.firstName;
    data['lastName'] = this.lastName;
    data['middleName'] = this.middleName;
    data['webAddress'] = this.webAddress;
    data['businessName'] = this.businessName;

    if (this.address) {
      data['address'] = this.address.toJson();
    }

    if (this.emails && this.emails.length > 0) {
      data['emails'] = [];
      for (let item of this.emails) {
        data['emails'].push(item.toJson());
      }
    }

    if (this.phones && this.phones.length > 0) {
      data['phones'] = [];
      for (let item of this.phones) {
        data['phones'].push(item.toJson());
      }
    }

    return data;
  }
}
