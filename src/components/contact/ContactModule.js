import EntryView from '../common/EntryView';
import EntryEdit from '../common/EntryEdit';
import Search from '../common/Search';
import Trashed from '../common/Trashed';
import ContactList from './ContactList';
import Contact from './Contact';
import NPModule from '../../core/datamodel/NPModule';
import FolderDetail from '../folder/FolderDetail';
import AppRoute from '../AppRoute';

export default class ContactModule extends AppRoute {
  static routes (base) {
    AppRoute.base = base;

    if (base) {
      base = '/' + base;
    } else {
      base = '';
    }

    return [
      {
        path: base + '/contact',
        component: Contact,
        props: { moduleId: NPModule.CONTACT },
        children: [
          {
            name: 'contactHome',
            path: '',
            component: ContactList
          },
          {
            name: 'contactFolder',
            path: 'folder/:folderId',
            component: ContactList
          },
          {
            name: 'sharedContactFolder',
            path: 'shared/:user/:folderId',
            component: ContactList
          },
          {
            name: 'newContactFolder',
            path: 'folder/add',
            component: FolderDetail,
            props: true
          },
          {
            name: 'updateContactFolder',
            path: 'folder/:folderId/update',
            component: FolderDetail,
            props: true
          },
          {
            name: 'contactSearch',
            path: 'search',
            component: Search,
            props: true
          },
          {
            name: 'contactTrash',
            path: 'trash',
            component: Trashed,
            props: true
          }
        ]
      },
      {
        path: base + '/contact/:entryId/view',
        name: 'viewContact',
        component: EntryView,
        props: true
      },
      {
        path: base + '/contact/add',
        name: 'newContact',
        component: EntryEdit,
        props: true
      },
      {
        path: base + '/contact/:entryId/edit',
        name: 'editContact',
        component: EntryEdit,
        props: true
      },
      {
        path: base + '/contact/shared/:user/:entryId/view',
        name: 'viewSharedContact',
        component: EntryView,
        props: true
      },
      {
        path: base + '/contact/shared/:user/add',
        name: 'newSharedContact',
        component: EntryEdit,
        props: true
      },
      {
        path: base + '/contact/shared/:user/:entryId/edit',
        name: 'editSharedContact',
        component: EntryEdit,
        props: true
      }
    ];
  }
}
