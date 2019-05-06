import NPEntry from './NPEntry';
import NPModule from './NPModule';
import NPFolder from './NPFolder';

export default class NPPhoto extends NPEntry {
  lightbox;
  downloadLink;

  constructor (data) {
    super(data);

    if (data) {
      this.lightbox = data['lightbox'];
      this.downloadLink = data['downloadLink'];
    }

    if (!this.folder) {
      this.folder = NPFolder.of(NPModule.PHOTO, NPFolder.ROOT);
    }

    this.setModuleId(NPModule.PHOTO);
  }

  toJson () {
    return super.toJson();
  }
}
