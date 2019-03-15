import EntryView from '../common/EntryView';
import EntryEdit from '../common/EntryEdit';
import Search from '../common/Search';
import Trashed from '../common/Trashed';
import DocList from './DocList';
import Doc from './Doc';
import NPModule from '../../core/datamodel/NPModule';
import FolderDetail from '../folder/FolderDetail';
import AppRoute from '../AppRoute';

export default class DocModule extends AppRoute {
  static routes (base) {
    AppRoute.base = base;

    if (base) {
      base = '/' + base;
    } else {
      base = '';
    }

    return [
      {
        path: base + '/doc',
        component: Doc,
        props: { moduleId: NPModule.DOC },
        children: [
          {
            name: 'docHome',
            path: '',
            component: DocList
          },
          {
            name: 'docFolder',
            path: 'folder/:folderId',
            component: DocList
          },
          {
            name: 'sharedDocFolder',
            path: 'shared/:user/:folderId',
            component: DocList
          },
          {
            name: 'newDocFolder',
            path: 'folder/add',
            component: FolderDetail,
            props: true
          },
          {
            name: 'updateDocFolder',
            path: 'folder/:folderId/update',
            component: FolderDetail,
            props: true
          },
          {
            name: 'docSearch',
            path: 'search',
            component: Search,
            props: true
          },
          {
            name: 'docTrash',
            path: 'trash',
            component: Trashed,
            props: true
          }
        ]
      },
      {
        path: base + '/doc/:entryId/view',
        name: 'viewDoc',
        component: EntryView,
        props: true
      },
      {
        path: base + '/doc/add',
        name: 'newDoc',
        component: EntryEdit,
        props: true
      },
      {
        path: base + '/doc/:entryId/edit',
        name: 'editDoc',
        component: EntryEdit,
        props: true
      },
      {
        path: base + '/doc/shared/:user/:entryId/view',
        name: 'viewSharedDoc',
        component: EntryView,
        props: true
      },
      {
        path: base + '/doc/shared/:user/add',
        name: 'newSharedDoc',
        component: EntryEdit,
        props: true
      },
      {
        path: base + '/doc/shared/:user/:entryId/edit',
        name: 'editSharedDoc',
        component: EntryEdit,
        props: true
      }
    ];
  }
}
