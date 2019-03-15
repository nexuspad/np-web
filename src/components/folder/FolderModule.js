import NPModule from '../../core/datamodel/NPModule';
import FolderDetail from './FolderDetail';

export default class FolderModule {
  static routes (base) {
    if (base) {
      base = '/' + base;
    } else {
      base = '';
    }

    return [
      {
        name: 'newBookmarkFolder',
        path: base + '/bookmark/folder/add',
        component: FolderDetail,
        props: { moduleId: NPModule.BOOKMARK }
      },
      {
        name: 'updateBookmarkFolder',
        path: base + '/bookmark/folder/:folderId/update',
        component: FolderDetail,
        props: { moduleId: NPModule.BOOKMARK }
      },
      {
        name: 'newContactFolder',
        path: base + '/contact/folder/add',
        component: FolderDetail,
        props: { moduleId: NPModule.CONTACT }
      },
      {
        name: 'updateContactFolder',
        path: base + '/contact/folder/:folderId/update',
        component: FolderDetail,
        props: { moduleId: NPModule.CONTACT }
      },
      {
        name: 'newDocFolder',
        path: base + '/doc/folder/add',
        component: FolderDetail,
        props: { moduleId: NPModule.DOC }
      },
      {
        name: 'updateDocFolder',
        path: base + '/doc/folder/:folderId/update',
        component: FolderDetail,
        props: { moduleId: NPModule.DOC }
      },
      {
        name: 'newPhotoFolder',
        path: base + '/photo/folder/add',
        component: FolderDetail,
        props: { moduleId: NPModule.PHOTO }
      },
      {
        name: 'updatePhotoFolder',
        path: base + '/photo/folder/:folderId/update',
        component: FolderDetail,
        props: { moduleId: NPModule.PHOTO }
      },
      {
        name: 'newCalendar',
        path: base + '/calendar/add',
        component: FolderDetail,
        props: { moduleId: NPModule.CALENDAR }
      },
      {
        name: 'updateCalendar',
        path: base + '/calendar/:folderId/update',
        component: FolderDetail,
        props: { moduleId: NPModule.CALENDAR }
      }
    ];
  }
}
