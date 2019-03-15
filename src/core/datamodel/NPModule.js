export default class NPModule {
  static NOT_ASSIGNED = 0;

  static CONTACT = 1;
  static CALENDAR = 2;
  static EVENT = 2;
  static BOOKMARK = 3;
  static DOC = 4;
  static PHOTO = 6;
  static UPLOAD = 5;

  static idForCode (code) {
    switch (code) {
      case 'bookmark':
        return NPModule.BOOKMARK;
      case 'contact':
        return NPModule.CONTACT;
      case 'calendar':
        return NPModule.CALENDAR;
      case 'doc':
        return NPModule.DOC;
      case 'photo':
        return NPModule.PHOTO;
      default:
        return NPModule.NOT_ASSIGNED;
    }
  }

  static codeForId (id) {
    switch (id) {
      case NPModule.BOOKMARK:
        return 'bookmark';
      case NPModule.CONTACT:
        return 'contact';
      case NPModule.CALENDAR:
        return 'calendar';
      case NPModule.DOC:
        return 'doc';
      case NPModule.PHOTO:
        return 'photo';
      case NPModule.UPLOAD:
        return 'upload';
    }
  }
}
