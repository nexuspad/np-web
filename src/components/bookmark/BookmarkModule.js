import EntryView from '../common/EntryView';
import EntryEdit from '../common/EntryEdit';
import Trashed from '../common/Trashed';
import Search from '../common/Search';
import BookmarkList from './BookmarkList.vue';
import Bookmark from './Bookmark';
import NPModule from '../../core/datamodel/NPModule';
import FolderDetail from '../folder/FolderDetail';
import AppRoute from '../AppRoute';

export default class BookmarkModule extends AppRoute {
  static routes (base) {
    AppRoute.base = base;

    if (base) {
      base = '/' + base;
    } else {
      base = '';
    }

    return [
      {
        path: base + '/bookmark',
        component: Bookmark,
        props: { moduleId: NPModule.BOOKMARK },
        children: [
          {
            name: 'bookmarkHome',
            path: '',
            component: BookmarkList
          },
          {
            name: 'bookmarkFolder',
            path: 'folder/:folderId',
            component: BookmarkList
          },
          {
            name: 'sharedBookmarkFolder',
            path: 'shared/:user/:folderId',
            component: BookmarkList
          },
          {
            name: 'newBookmarkFolder',
            path: 'folder/add',
            component: FolderDetail,
            props: true
          },
          {
            name: 'updateBookmarkFolder',
            path: 'folder/:folderId/update',
            component: FolderDetail,
            props: true
          },
          {
            name: 'bookmarkSearch',
            path: 'search',
            component: Search,
            props: true
          },
          {
            name: 'bookmarkTrash',
            path: 'trash',
            component: Trashed,
            props: true
          }
        ]
      },
      {
        path: base + '/bookmark/:entryId/view',
        name: 'viewBookmark',
        component: EntryView,
        props: true
      },
      {
        path: base + '/bookmark/add',
        name: 'newBookmark',
        component: EntryEdit,
        props: true
      },
      {
        path: base + '/bookmark/:entryId/edit',
        name: 'editBookmark',
        component: EntryEdit,
        props: true
      },
      {
        path: base + '/bookmark/shared/:user/:entryId/view',
        name: 'viewSharedBookmark',
        component: EntryView,
        props: true
      },
      {
        path: base + '/bookmark/shared/:user/add',
        name: 'newSharedBookmark',
        component: EntryEdit,
        props: true
      },
      {
        path: base + '/bookmark/shared/:user/:entryId/edit',
        name: 'editSharedBookmark',
        component: EntryEdit,
        props: true
      }
    ];
  }
}
