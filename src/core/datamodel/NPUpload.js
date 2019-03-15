import NPModule from '../datamodel/NPModule';
import NPEvent from '../datamodel/NPEvent';
import NPContact from '../datamodel/NPContact';
import NPDoc from '../datamodel/NPDoc';
import NPBookmark from '../datamodel/NPBookmark';
import NPPhoto from '../datamodel/NPPhoto';
import NPFolder from './NPFolder';
import EntryTemplate from './EntryTemplate';
import NPEntry from './NPEntry';
import CommonUtils from '../util/CommonUtils';

export default class NPUpload extends NPEntry {
  originalName;
  fileName;
  fileType;
  fileSize;
  viewLink;
  downloadLink;
  cloudConfig;
  image;
  parentEntry;

  // these are UI specific properties. they must be added here to make vue reactive on them.
  showLink;
  showImage;
  isLoading = true;

  constructor (data) {
    super(data);

    if (data) {
      this.title = data['originalName'];
      this.originalName = data['originalName'];
      this.fileName = data['fileName'];
      this.fileType = data['fileType'];
      this.fileSize = parseInt(data['fileSize']);
      this.image = data['image'];

      if (data['downloadLink']) {
        this.viewLink = data['downloadLink'];
        this.downloadLink = CommonUtils.addParamToUrl(data['downloadLink'], 'download', true);
      }

      this.cloudConfig = data['cloudConfig'];
      this.image = data['image'];

      if (data['parentEntry']) {
        switch (data['parentEntry'].moduleId) {
          case NPModule.BOOKMARK:
            this.parentEntry = new NPBookmark(data['parentEntry']);
            break;
          case NPModule.CONTACT:
            this.parentEntry = new NPContact(data['parentEntry']);
            break;
          case NPModule.CALENDAR:
            this.parentEntry = new NPEvent(data['parentEntry']);
            break;
          case NPModule.DOC:
            this.parentEntry = new NPDoc(data['parentEntry']);
            break;
          case NPModule.PHOTO:
            this.parentEntry = new NPPhoto(data['parentEntry']);
            break;
        }
      }
    }

    this.templateId = EntryTemplate.UPLOAD;
  }

  static initWith (file, forModule, inFolder) {
    let uploadEntry = new NPUpload();
    uploadEntry.fileName = file.name;

    switch (forModule) {
      case NPModule.BOOKMARK:
        uploadEntry.parentEntry = new NPBookmark();
        break;
      case NPModule.CONTACT:
        uploadEntry.parentEntry = new NPContact();
        break;
      case NPModule.CALENDAR:
        uploadEntry.parentEntry = new NPEvent();
        break;
      case NPModule.DOC:
        uploadEntry.parentEntry = new NPDoc();
        break;
      case NPModule.PHOTO:
        uploadEntry.parentEntry = new NPPhoto();
        break;
    }

    uploadEntry.parentEntry.folder = NPFolder.of(forModule, inFolder);

    return uploadEntry;
  }

  isImage () {
    if (this.fileType === 'gif' || this.fileType === 'gifv' || this.fileType === 'jpg' ||
        this.fileType === 'jpeg' || this.fileType === 'png') {
      return true;
    }
    return false;
  }

  toJson () {
    return {
      moduleId: NPModule.UPLOAD,
      fileName: this.fileName,
      parentEntry: this.parentEntry.toJson()
    };
  }
}
