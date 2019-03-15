import NPEntry from './NPEntry';
import NPModule from './NPModule';
import NPFolder from './NPFolder';

export default class NPBookmark extends NPEntry {
  constructor (data) {
    super(data);

    if (data) {
      this.webAddress = data['webAddress'];
    }

    if (!this.folder) {
      this.folder = NPFolder.of(NPModule.BOOKMARK, NPFolder.ROOT);
    }

    this.setModuleId(NPModule.BOOKMARK);
  }

  static blankInstance (folder, entryId) {
    let obj = new NPBookmark();
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
    data['webAddress'] = this.webAddress;
    return data;
  }
}
