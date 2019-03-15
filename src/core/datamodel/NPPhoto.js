import NPEntry from './NPEntry';
import NPModule from './NPModule';
import NPFolder from './NPFolder';

export default class NPPhoto extends NPEntry {
  thumbnail;
  lightbox;
  original;

  constructor (data) {
    super(data);

    if (data) {
      this.thumbnail = data['thumbnail'];
      this.lightbox = data['lightbox'];
      this.original = data['original'];
      this.downloadLink = this.original + '&download=1';
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
