import NPEntry from './NPEntry';
import NPModule from './NPModule';
import NPFolder from './NPFolder';
import NPUpload from './NPUpload';

export default class NPDoc extends NPEntry {
  format = '';
  note = '';
  attachments = [];

  constructor (data) {
    super(data);

    if (data) {
      this.note = data['note'];
      this.format = data['format'];

      if (data['attachments']) {
        data['attachments'].forEach(attachmentData => {
          this.attachments.push(new NPUpload(attachmentData));
        });
      }
    }

    if (!this.folder) {
      this.folder = NPFolder.of(NPModule.DOC, NPFolder.ROOT);
    }

    if (!this.format) {
      this.format = 'TEXT';
    }

    this.setModuleId(NPModule.DOC);

    // update the attachments
  }

  copy (otherDoc) {
    super.copy(otherDoc);
    this.format = otherDoc.format;
    this.note = otherDoc.note;
    this.attachments = otherDoc.attachments;
  }

  static blankInstance (folder, entryId) {
    let obj = new NPDoc();
    obj.folder = folder;
    obj.owner = folder.owner;

    if (entryId) {
      obj.entryId = entryId;
    } else {
      obj.entryId = '';
    }

    return obj;
  }
}
